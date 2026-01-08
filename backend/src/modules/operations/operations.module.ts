import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { Operation } from './entities/operation.entity';
import { User } from '@modules/users/entities/user.entity';
import { Escrow } from '@modules/escrows/entities/escrow.entity';
import { AuditModule } from '@modules/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Operation, User, Escrow]),
    AuditModule,
  ],
  controllers: [OperationsController],
  providers: [OperationsService],
  exports: [OperationsService],
})
export class OperationsModule {}
