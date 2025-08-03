import { Module, forwardRef } from '@nestjs/common';
import { CoordinatorService } from './coordinator.service';
import { QueueModule } from '../queue/queue.module';
import { TaskModule } from '../tasks/task.module';
import { WorkflowModule } from '../workflows/workflow.module';

@Module({
  imports: [QueueModule, forwardRef(() => TaskModule), WorkflowModule],
  providers: [CoordinatorService],
  exports: [CoordinatorService],
})
export class CoordinatorModule {} 