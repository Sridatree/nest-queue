import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { CoordinatorModule } from '../coordinator/coordinator.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity]), forwardRef(() => CoordinatorModule)],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService, TypeOrmModule],
})
export class TaskModule {} 