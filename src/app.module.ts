import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { CoordinatorModule } from './coordinator/coordinator.module';
import { QueueModule } from './queue/queue.module';
import { TaskModule } from './tasks/task.module';
import { WorkerModule } from './worker/worker.module';
import { WorkflowModule } from './workflows/workflow.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    QueueModule,
    WorkerModule,
    TaskModule,
    WorkflowModule,
    CoordinatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
