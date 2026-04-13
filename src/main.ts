import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', {
    exclude: ['/', 'login', 'welcome', 'register', 'community', 'matches', 'news', 'store', 'forum', 'gallery', 'highlights', 'equipe', 'donate', 'lucky-draw', 'points', 'fun-zone', 'premium', 'profile', 'support', 'vote', 'admin'],
  });

  app.enableCors({
    origin: true, // Allow any origin in development for easier mobile testing
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('USM Media API')
    .setDescription('Union Sportive Monastirienne — Digital Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3002;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API running on port ${port}`);
  console.log(`🌍 Production API: https://usm-production-cd9a.up.railway.app/api`);
  console.log(`📖 Swagger docs at: http://localhost:${port}/api`);
}
bootstrap().catch(err => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});
