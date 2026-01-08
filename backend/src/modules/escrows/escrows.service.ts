import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Escrow } from './entities/escrow.entity';
import { Operation } from '@modules/operations/entities/operation.entity';
import { ValidateDepositDto } from './dto/validate-deposit.dto';
import { ReleaseFundsDto } from './dto/release-funds.dto';
import { OperationStatus, AuditAction } from '@common/enums';
import { AuditService } from '@modules/audit/audit.service';

@Injectable()
export class EscrowsService {
  constructor(
    @InjectRepository(Escrow)
    private readonly escrowRepository: Repository<Escrow>,
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
    private readonly auditService: AuditService,
  ) {}

  async validateDeposit(
    operationId: string,
    validateDepositDto: ValidateDepositDto,
    adminId: string,
  ): Promise<Escrow> {
    const operation = await this.operationRepository.findOne({
      where: { id: operationId },
    });

    if (!operation) {
      throw new NotFoundException('Operación no encontrada');
    }

    if (operation.status !== OperationStatus.ACEPTADA) {
      throw new BadRequestException('La operación debe estar en estado ACEPTADA');
    }

    const escrow = await this.escrowRepository.findOne({
      where: { operationId },
    });

    if (!escrow) {
      throw new NotFoundException('Registro de escrow no encontrado');
    }

    if (escrow.depositedAmount) {
      throw new BadRequestException('El depósito ya fue validado');
    }

    const { amount, reference } = validateDepositDto;

    // Validar monto
    if (amount !== operation.agreedPrice) {
      throw new BadRequestException(
        `El monto depositado (${amount}) no coincide con el precio acordado (${operation.agreedPrice})`,
      );
    }

    // Actualizar escrow
    escrow.depositedAmount = amount;
    escrow.depositDate = new Date();
    escrow.depositValidatedBy = adminId;
    escrow.depositValidatedAt = new Date();
    escrow.depositReference = reference;

    const updated = await this.escrowRepository.save(escrow);

    // Actualizar estado de operación
    operation.status = OperationStatus.FONDOS_EN_CUSTODIA;
    await this.operationRepository.save(operation);

    // Auditoría
    await this.auditService.log({
      operationId,
      userId: adminId,
      action: AuditAction.DEPOSIT_VALIDATED,
      description: `Depósito validado: $${amount}`,
      metadata: { amount, reference },
    });

    return updated;
  }

  async releaseFunds(
    operationId: string,
    releaseFundsDto: ReleaseFundsDto,
    adminId: string,
  ): Promise<Escrow> {
    const operation = await this.operationRepository.findOne({
      where: { id: operationId },
      relations: ['seller', 'buyer'],
    });

    if (!operation) {
      throw new NotFoundException('Operación no encontrada');
    }

    if (operation.status !== OperationStatus.EN_TRANSFERENCIA) {
      throw new BadRequestException('La operación debe estar en estado EN_TRANSFERENCIA');
    }

    const escrow = await this.escrowRepository.findOne({
      where: { operationId },
    });

    if (!escrow || !escrow.depositedAmount) {
      throw new BadRequestException('No hay fondos en custodia');
    }

    if (escrow.releasedAmount) {
      throw new BadRequestException('Los fondos ya fueron liberados');
    }

    const { releaseToSeller, reference } = releaseFundsDto;

    // Liberar fondos
    escrow.releasedAmount = escrow.depositedAmount;
    escrow.releasedTo = releaseToSeller ? operation.sellerId : operation.buyerId;
    escrow.releasedBy = adminId;
    escrow.releasedAt = new Date();
    escrow.releaseReference = reference;

    const updated = await this.escrowRepository.save(escrow);

    // Actualizar estado de operación
    operation.status = OperationStatus.LIBERADA;
    operation.completedAt = new Date();
    await this.operationRepository.save(operation);

    // Auditoría
    const action = releaseToSeller 
      ? AuditAction.FUNDS_RELEASED 
      : AuditAction.FUNDS_RETURNED;

    const recipient = releaseToSeller 
      ? operation.seller.fullName 
      : operation.buyer.fullName;

    await this.auditService.log({
      operationId,
      userId: adminId,
      action,
      description: `Fondos ${releaseToSeller ? 'liberados' : 'devueltos'} a ${recipient}`,
      metadata: { 
        amount: escrow.releasedAmount, 
        recipient,
        reference,
      },
    });

    return updated;
  }

  async findByOperation(operationId: string): Promise<Escrow> {
    const escrow = await this.escrowRepository.findOne({
      where: { operationId },
      relations: ['operation', 'depositValidator', 'releaseAdmin', 'releaseRecipient'],
    });

    if (!escrow) {
      throw new NotFoundException('Registro de escrow no encontrado');
    }

    return escrow;
  }
}
