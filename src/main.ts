import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // SPA fallback middleware: Serve index.html for all non-API, non-asset routes
  app.use((req: any, res: any, next: any) => {
    const url = req.url;
    if (url.startsWith('/api') || url.startsWith('/uploads') || url.includes('.')) {
      return next();
    }
    const indexPath = join(process.cwd(), 'public', 'index.html');
    res.sendFile(indexPath, (err: any) => {
      if (err) {
        // index.html not found (frontend not built yet on this deployment)
        next();
      }
    });
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
