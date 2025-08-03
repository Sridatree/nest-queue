import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { TaskModule } from '../tasks/task.module';
import { WorkflowModule } from '../workflows/workflow.module';

@Module({
  imports: [TaskModule, WorkflowModule],
  providers: [WorkerService],
})
export class WorkerModule {} 