import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { redisOptions } from './config/redis.config';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ---- Bull Board UI ----
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  const taskQueue = new Queue('tasks', { connection: new IORedis(redisOptions) });

  createBullBoard({ queues: [new BullMQAdapter(taskQueue)], serverAdapter });

  // Attach Bull Board routes to Nest (Express) app
  app.use('/queues', serverAdapter.getRouter());

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
