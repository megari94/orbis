import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos desde /uploads (avatares, etc.)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  // Servir el frontend de React (CSS, JS, assets)
  const clientPath = join(__dirname, '..', '..', 'client');
  if (existsSync(clientPath)) {
    app.useStaticAssets(clientPath);
  }

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    /^http:\/\/localhost(:\d+)?$/,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / curl
      const allowed = allowedOrigins.some(o =>
        typeof o === 'string' ? o === origin : (o as RegExp).test(origin)
      );
      if (allowed) callback(null, true);
      else callback(new Error(`CORS bloqueado para: ${origin}`));
    },
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('ORBIS API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  // SPA fallback: cualquier ruta que no sea /api ni /uploads sirve index.html
  if (existsSync(clientPath)) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get(/^(?!\/api|\/uploads).*$/, (_req: any, res: any) => {
      res.sendFile(join(clientPath, 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`ORBIS backend running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}
bootstrap();
