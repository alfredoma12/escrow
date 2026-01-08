import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { DocumentType } from '@common/enums';
import { Operation } from '@modules/operations/entities/operation.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('documents')
@Check(`"file_size" > 0`)
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operation_id' })
  @Index()
  operationId: string;

  @ManyToOne(() => Operation)
  @JoinColumn({ name: 'operation_id' })
  operation: Operation;

  @Column({ name: 'uploaded_by' })
  @Index()
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
  })
  @Index()
  documentType: DocumentType;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'is_validated', default: false })
  isValidated: boolean;

  @Column({ name: 'validated_by', nullable: true })
  validatedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validated_by' })
  validator: User;

  @Column({ name: 'validated_at', nullable: true })
  validatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
