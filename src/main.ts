import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All controllers go under /api prefix (except root /)
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // Serve static frontend assets (JS, CSS, images, etc.) from /public
  app.use(express.static(join(process.cwd(), 'public')));

  // SPA fallback: serve index.html for all non-API, non-upload routes
  // This enables client-side routing (refreshing /home, /matches etc. works)
  app.use((req: any, res: any, next: any) => {
    const url: string = req.url;
    if (url.startsWith('/api') || url.startsWith('/uploads')) {
      return next();
    }
    const indexPath = join(process.cwd(), 'public', 'index.html');
    res.sendFile(indexPath, (err: any) => {
      if (err) {
        next(); // index.html missing — let NestJS handle it
      }
    });
  });

  app.enableCors({
    origin: true,
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
