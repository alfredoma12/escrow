import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Operation } from '@modules/operations/entities/operation.entity';
import { DocumentType, AuditAction } from '@common/enums';
import { AuditService } from '@modules/audit/audit.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
    private readonly auditService: AuditService,
  ) {}

  async upload(
    operationId: string,
    file: Express.Multer.File,
    documentType: DocumentType,
    userId: string,
    description?: string,
  ): Promise<Document> {
    const operation = await this.operationRepository.findOne({
      where: { id: operationId },
    });

    if (!operation) {
      throw new NotFoundException('Operación no encontrada');
    }

    const document = this.documentRepository.create({
      operationId,
      uploadedBy: userId,
      documentType,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      description,
    });

    const saved = await this.documentRepository.save(document);

    await this.auditService.log({
      operationId,
      userId,
      action: AuditAction.DOCUMENT_UPLOADED,
      description: `Documento subido: ${documentType}`,
      metadata: { fileName: file.originalname, documentType },
    });

    return saved;
  }

  async findByOperation(operationId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { operationId },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async validateDocument(documentId: string, adminId: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    if (document.isValidated) {
      throw new BadRequestException('El documento ya fue validado');
    }

    document.isValidated = true;
    document.validatedBy = adminId;
    document.validatedAt = new Date();

    return this.documentRepository.save(document);
  }

  async delete(documentId: string, userId: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    if (document.uploadedBy !== userId && document.isValidated) {
      throw new BadRequestException('No se puede eliminar un documento validado');
    }

    // Eliminar archivo físico
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await this.documentRepository.remove(document);
  }
}
