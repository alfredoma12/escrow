import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { OperationStatus } from '@common/enums';
import { User } from '@modules/users/entities/user.entity';

@Entity('operations')
@Check(`"buyer_id" != "seller_id"`)
@Check(`"agreed_price" > 0`)
export class Operation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operation_number', unique: true })
  @Index()
  operationNumber: string;

  @Column({ name: 'buyer_id' })
  @Index()
  buyerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ name: 'seller_id' })
  @Index()
  sellerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ name: 'vehicle_patent', nullable: true })
  vehiclePatent: string;

  @Column({ name: 'vehicle_brand', nullable: true })
  vehicleBrand: string;

  @Column({ name: 'vehicle_model', nullable: true })
  vehicleModel: string;

  @Column({ name: 'vehicle_year', nullable: true })
  vehicleYear: number;

  @Column({ name: 'agreed_price', type: 'decimal', precision: 12, scale: 2 })
  agreedPrice: number;

  @Column({
    type: 'enum',
    enum: OperationStatus,
    default: OperationStatus.CREADA,
  })
  @Index()
  status: OperationStatus;

  @Column({ name: 'deadline_date', type: 'date' })
  deadlineDate: Date;

  @Column({ name: 'buyer_accepted', default: false })
  buyerAccepted: boolean;

  @Column({ name: 'seller_accepted', default: false })
  sellerAccepted: boolean;

  @Column({ name: 'buyer_accepted_at', nullable: true })
  buyerAcceptedAt: Date;

  @Column({ name: 'seller_accepted_at', nullable: true })
  sellerAcceptedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;
}
