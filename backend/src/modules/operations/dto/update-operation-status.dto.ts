import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OperationStatus } from '@common/enums';

export class UpdateOperationStatusDto {
  @ApiProperty({ enum: OperationStatus })
  @IsEnum(OperationStatus)
  newStatus: OperationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
