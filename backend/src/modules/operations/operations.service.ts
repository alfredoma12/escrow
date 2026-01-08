import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Operation } from './entities/operation.entity';
import { Escrow } from '@modules/escrows/entities/escrow.entity';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationStatusDto } from './dto/update-operation-status.dto';
import { OperationStatus, VALID_STATUS_TRANSITIONS, AuditAction, UserRole } from '@common/enums';
import { AuditService } from '@modules/audit/audit.service';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
    @InjectRepository(Escrow)
    private readonly escrowRepository: Repository<Escrow>,
    private readonly auditService: AuditService,
  ) {}

  async create(createOperationDto: CreateOperationDto, userId: string): Promise<Operation> {
    const { buyerId, sellerId, agreedPrice, deadlineDate, ...vehicleData } = createOperationDto;

    // Validaciones
    if (buyerId === sellerId) {
      throw new BadRequestException('El comprador y vendedor no pueden ser la misma persona');
    }

    if (new Date(deadlineDate) <= new Date()) {
      throw new BadRequestException('La fecha límite debe ser futura');
    }

    // Crear operación
    const operation = this.operationRepository.create({
      buyerId,
      sellerId,
      agreedPrice,
      deadlineDate,
      ...vehicleData,
      status: OperationStatus.CREADA,
    });

    const savedOperation = await this.operationRepository.save(operation);

    // Crear registro de escrow
    const escrow = this.escrowRepository.create({
      operationId: savedOperation.id,
    });
    await this.escrowRepository.save(escrow);

    // Auditoría
    await this.auditService.log({
      operationId: savedOperation.id,
      userId,
      action: AuditAction.CREATE_OPERATION,
      description: `Operación ${savedOperation.operationNumber} creada`,
      metadata: { agreedPrice, buyerId, sellerId },
    });

    return savedOperation;
  }

  async findAll(filters?: {
    userId?: string;
    role?: UserRole;
    status?: OperationStatus;
  }): Promise<Operation[]> {
    const query = this.operationRepository
      .createQueryBuilder('operation')
      .leftJoinAndSelect('operation.buyer', 'buyer')
      .leftJoinAndSelect('operation.seller', 'seller')
      .orderBy('operation.createdAt', 'DESC');

    if (filters?.userId && filters?.role) {
      if (filters.role === UserRole.BUYER) {
        query.where('operation.buyerId = :userId', { userId: filters.userId });
      } else if (filters.role === UserRole.SELLER) {
        query.where('operation.sellerId = :userId', { userId: filters.userId });
      }
    }

    if (filters?.status) {
      query.andWhere('operation.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(id: string, userId?: string, role?: UserRole): Promise<Operation> {
    const operation = await this.operationRepository.findOne({
      where: { id },
      relations: ['buyer', 'seller'],
    });

    if (!operation) {
      throw new NotFoundException('Operación no encontrada');
    }

    // Verificar acceso si no es admin
    if (userId && role !== UserRole.ADMIN) {
      if (operation.buyerId !== userId && operation.sellerId !== userId) {
        throw new ForbiddenException('No tienes acceso a esta operación');
      }
    }

    return operation;
  }

  async acceptTerms(
    operationId: string, 
    userId: string, 
    role: UserRole,
  ): Promise<Operation> {
    const operation = await this.findOne(operationId, userId, role);

    if (operation.status !== OperationStatus.CREADA) {
      throw new BadRequestException('La operación no está en estado CREADA');
    }

    if (operation.buyerId === userId) {
      operation.buyerAccepted = true;
      operation.buyerAcceptedAt = new Date();
    } else if (operation.sellerId === userId) {
      operation.sellerAccepted = true;
      operation.sellerAcceptedAt = new Date();
    } else {
      throw new ForbiddenException('No eres parte de esta operación');
    }

    // Si ambos aceptaron, cambiar estado
    if (operation.buyerAccepted && operation.sellerAccepted) {
      operation.status = OperationStatus.ACEPTADA;
    }

    const updated = await this.operationRepository.save(operation);

    await this.auditService.log({
      operationId,
      userId,
      action: AuditAction.ACCEPT_TERMS,
      description: `Términos aceptados por ${role}`,
      metadata: { role },
    });

    return updated;
  }

  async updateStatus(
    operationId: string,
    updateStatusDto: UpdateOperationStatusDto,
    adminId: string,
  ): Promise<Operation> {
    const operation = await this.findOne(operationId);
    const { newStatus, reason } = updateStatusDto;

    // Validar transición de estado
    const validTransitions = VALID_STATUS_TRANSITIONS[operation.status];
    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar de ${operation.status} a ${newStatus}`,
      );
    }

    const oldStatus = operation.status;
    operation.status = newStatus;

    if (newStatus === OperationStatus.LIBERADA || newStatus === OperationStatus.CANCELADA) {
      operation.completedAt = new Date();
    }

    const updated = await this.operationRepository.save(operation);

    await this.auditService.log({
      operationId,
      userId: adminId,
      action: AuditAction.STATUS_CHANGED,
      description: `Estado cambiado de ${oldStatus} a ${newStatus}`,
      metadata: { oldStatus, newStatus, reason },
    });

    return updated;
  }

  async getStats() {
    return this.operationRepository
      .createQueryBuilder('operation')
      .select('operation.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(operation.agreedPrice)', 'total')
      .groupBy('operation.status')
      .getRawMany();
  }
}
