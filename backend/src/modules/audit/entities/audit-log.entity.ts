import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AuditAction } from '@common/enums';
import { Operation } from '@modules/operations/entities/operation.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operation_id', nullable: true })
  @Index()
  operationId: string;

  @ManyToOne(() => Operation)
  @JoinColumn({ name: 'operation_id' })
  operation: Operation;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  @Index()
  action: AuditAction;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}
