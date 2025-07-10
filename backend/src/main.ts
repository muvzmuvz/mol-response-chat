import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: '*', // Allow all origins, adjust as needed for production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',});
    
  await app.listen(3000);
  

  console.log('Server running on http://localhost:3000');
}
bootstrap();