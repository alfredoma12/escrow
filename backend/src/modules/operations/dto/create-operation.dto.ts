import { IsUUID, IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOperationDto {
  @ApiProperty({ description: 'ID del comprador' })
  @IsUUID()
  buyerId: string;

  @ApiProperty({ description: 'ID del vendedor' })
  @IsUUID()
  sellerId: string;

  @ApiProperty({ example: 'AB1234', required: false })
  @IsOptional()
  @IsString()
  vehiclePatent?: string;

  @ApiProperty({ example: 'Toyota', required: false })
  @IsOptional()
  @IsString()
  vehicleBrand?: string;

  @ApiProperty({ example: 'Corolla', required: false })
  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @ApiProperty({ example: 2020, required: false })
  @IsOptional()
  @IsNumber()
  vehicleYear?: number;

  @ApiProperty({ example: 8500000, description: 'Precio acordado en CLP' })
  @IsNumber()
  @Min(1)
  agreedPrice: number;

  @ApiProperty({ example: '2026-02-15', description: 'Fecha límite de la operación' })
  @IsDateString()
  deadlineDate: string;
}
