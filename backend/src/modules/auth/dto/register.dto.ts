import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @ApiProperty({ example: '12345678-9' })
  @IsString()
  @Matches(/^\d{7,8}-[\dkK]$/, { message: 'RUT inválido. Formato: 12345678-9' })
  rut: string;

  @ApiProperty({ example: 'Juan Pérez González' })
  @IsString()
  @MinLength(3)
  fullName: string;

  @ApiProperty({ example: '+56912345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.BUYER, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
