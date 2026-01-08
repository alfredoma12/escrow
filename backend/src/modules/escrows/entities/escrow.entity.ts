import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Index,
  Check,
} from 'typeorm';
import { Operation } from '@modules/operations/entities/operation.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('escrows')
@Check(`"deposited_amount" IS NULL OR "deposited_amount" > 0`)
@Check(`"released_amount" IS NULL OR "released_amount" > 0`)
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operation_id', unique: true })
  @Index()
  operationId: string;

  @OneToOne(() => Operation)
  @JoinColumn({ name: 'operation_id' })
  operation: Operation;

  @Column({ 
    name: 'deposited_amount', 
    type: 'decimal', 
    precision: 12, 
    scale: 2,
    nullable: true,
  })
  depositedAmount: number;

  @Column({ name: 'deposit_date', nullable: true })
  @Index()
  depositDate: Date;

  @Column({ name: 'deposit_validated_by', nullable: true })
  depositValidatedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'deposit_validated_by' })
  depositValidator: User;

  @Column({ name: 'deposit_validated_at', nullable: true })
  depositValidatedAt: Date;

  @Column({ name: 'deposit_reference', nullable: true })
  depositReference: string;

  @Column({ 
    name: 'released_amount', 
    type: 'decimal', 
    precision: 12, 
    scale: 2,
    nullable: true,
  })
  releasedAmount: number;

  @Column({ name: 'released_to', nullable: true })
  releasedTo: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'released_to' })
  releaseRecipient: User;

  @Column({ name: 'released_by', nullable: true })
  releasedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'released_by' })
  releaseAdmin: User;

  @Column({ name: 'released_at', nullable: true })
  releasedAt: Date;

  @Column({ name: 'release_reference', nullable: true })
  releaseReference: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
