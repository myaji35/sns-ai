import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:3010', 'http://localhost:3001'], // Next.js Frontend
    credentials: true,
  });

  // Swagger API 문서
  const config = new DocumentBuilder()
    .setTitle('ContentFlow AI - Workflow Engine API')
    .setDescription('AI 콘텐츠 생성 및 배포 워크플로우 API')
    .setVersion('1.0')
    .addTag('workflow')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3002);
  console.log('🚀 Workflow Engine running on http://localhost:3002');
  console.log('📚 API Documentation: http://localhost:3002/api');
}

bootstrap();
