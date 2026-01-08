import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseEnumPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { UserRole, DocumentType } from '@common/enums';
import * as path from 'path';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('operation/:operationId/upload')
  @ApiOperation({ summary: 'Subir documento' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/jpg',
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Tipo de archivo no permitido'), false);
        }
      },
    }),
  )
  async upload(
    @Param('operationId') operationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType', new ParseEnumPipe(DocumentType)) documentType: DocumentType,
    @Body('description') description: string,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    return this.documentsService.upload(
      operationId,
      file,
      documentType,
      user.id,
      description,
    );
  }

  @Get('operation/:operationId')
  @ApiOperation({ summary: 'Listar documentos de una operación' })
  async findByOperation(@Param('operationId') operationId: string) {
    return this.documentsService.findByOperation(operationId);
  }

  @Post(':id/validate')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Validar documento (solo admin)' })
  async validateDocument(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.documentsService.validateDocument(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar documento' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    await this.documentsService.delete(id, user.id);
    return { message: 'Documento eliminado exitosamente' };
  }
}
