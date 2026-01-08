import { IsNumber, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateDepositDto {
  @ApiProperty({ example: 8500000, description: 'Monto depositado' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'REF-123456', description: 'Referencia bancaria' })
  @IsString()
  reference: string;
}

export class ReleaseFundsDto {
  @ApiProperty({ 
    example: true, 
    description: 'true = liberar al vendedor, false = devolver al comprador',
  })
  @IsBoolean()
  releaseToSeller: boolean;

  @ApiProperty({ example: 'TRANSFER-789', description: 'Referencia de transferencia' })
  @IsString()
  reference: string;
}
