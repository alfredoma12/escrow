import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowsService } from './escrows.service';
import { EscrowsController } from './escrows.controller';
import { Escrow } from './entities/escrow.entity';
import { Operation } from '@modules/operations/entities/operation.entity';
import { AuditModule } from '@modules/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Escrow, Operation]),
    AuditModule,
  ],
  controllers: [EscrowsController],
  providers: [EscrowsService],
  exports: [EscrowsService],
})
export class EscrowsModule {}
