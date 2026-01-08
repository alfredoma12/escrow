import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { UserRole } from '@common/enums';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener información del usuario actual' })
  async getProfile(@CurrentUser() user: any) {
    const fullUser = await this.usersService.findOne(user.id);
    return this.usersService.sanitizeUser(fullUser);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Listar todos los usuarios (solo admin)' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return this.usersService.sanitizeUser(user);
  }
}
