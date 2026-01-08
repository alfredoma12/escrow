import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Seguridad
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:3001'),
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Prefijo de API
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Escrow API - Sistema de Custodia de Fondos')
    .setDescription('API REST para sistema de escrow de vehículos en Chile')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y registro')
    .addTag('operations', 'Operaciones de escrow')
    .addTag('documents', 'Gestión de documentos')
    .addTag('admin', 'Administración del sistema')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`
╔════════════════════════════════════════╗
║   ESCROW API - SISTEMA DE CUSTODIA    ║
╠════════════════════════════════════════╣
║  🚀 Server: http://localhost:${port}     ║
║  📚 Docs:   http://localhost:${port}/${apiPrefix}/docs ║
║  🌎 Env:    ${configService.get('NODE_ENV')}        ║
╚════════════════════════════════════════╝
  `);
}

bootstrap();
