import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EscrowsService } from './escrows.service';
import { ValidateDepositDto, ReleaseFundsDto } from './dto/validate-deposit.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { UserRole } from '@common/enums';

@ApiTags('escrows')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('escrows')
export class EscrowsController {
  constructor(private readonly escrowsService: EscrowsService) {}

  @Get('operation/:operationId')
  @ApiOperation({ summary: 'Obtener información de escrow por operación' })
  async findByOperation(@Param('operationId') operationId: string) {
    return this.escrowsService.findByOperation(operationId);
  }

  @Post('operation/:operationId/validate-deposit')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Validar depósito de fondos (solo admin)' })
  async validateDeposit(
    @Param('operationId') operationId: string,
    @Body() validateDepositDto: ValidateDepositDto,
    @CurrentUser() user: any,
  ) {
    return this.escrowsService.validateDeposit(operationId, validateDepositDto, user.id);
  }

  @Post('operation/:operationId/release-funds')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Liberar fondos (solo admin)' })
  async releaseFunds(
    @Param('operationId') operationId: string,
    @Body() releaseFundsDto: ReleaseFundsDto,
    @CurrentUser() user: any,
  ) {
    return this.escrowsService.releaseFunds(operationId, releaseFundsDto, user.id);
  }
}
