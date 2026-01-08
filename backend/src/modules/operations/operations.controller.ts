import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { OperationsService } from './operations.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationStatusDto } from './dto/update-operation-status.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { UserRole, OperationStatus } from '@common/enums';

@ApiTags('operations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva operación de escrow' })
  @ApiResponse({ status: 201, description: 'Operación creada exitosamente' })
  async create(
    @Body() createOperationDto: CreateOperationDto,
    @CurrentUser() user: any,
  ) {
    return this.operationsService.create(createOperationDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar operaciones' })
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: OperationStatus,
  ) {
    return this.operationsService.findAll({
      userId: user.role !== UserRole.ADMIN ? user.id : undefined,
      role: user.role,
      status,
    });
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Estadísticas de operaciones (solo admin)' })
  async getStats() {
    return this.operationsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener operación por ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.operationsService.findOne(id, user.id, user.role);
  }

  @Post(':id/accept-terms')
  @ApiOperation({ summary: 'Aceptar términos y condiciones' })
  async acceptTerms(@Param('id') id: string, @CurrentUser() user: any) {
    return this.operationsService.acceptTerms(id, user.id, user.role);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Actualizar estado de operación (solo admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOperationStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.operationsService.updateStatus(id, updateStatusDto, user.id);
  }
}
