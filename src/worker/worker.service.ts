import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { redisOptions } from '../config/redis.config';
import { TaskService } from '../tasks/task.service';
import { WorkflowExecutionService } from '../workflows/workflow-execution.service';
import { WorkflowExecutionStatus } from '../workflows/workflow-execution.entity';
import { TaskStatus } from '../tasks/task.entity';

@Injectable()
export class WorkerService implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;
  private queueEvents: QueueEvents;

  constructor(
    private readonly taskService: TaskService,
    private readonly workflowExecService: WorkflowExecutionService,
  ) {}

  onModuleInit() {
    const connection = new IORedis(redisOptions);

    this.worker = new Worker(
      'tasks',
      async (job) => {
        await this.taskService.updateTaskStatus(job.id as string, TaskStatus.IN_PROGRESS, job.attemptsMade);

        // Simulate business logic that can fail on purpose to exercise retries.
        if (job.data?.shouldFail && (job.attemptsMade ?? 0) < ((job.opts?.attempts as number) ?? 1) - 1) {
          // Fail until the last allowed attempt.
          throw new Error('Planned failure to test retry mechanism');
        }

        // Successful processing
        const result = { processedData: job.data, processedAt: new Date().toISOString() };
        return result;
      },
      { connection, concurrency: 5, lockDuration: 300000 },
    );

    this.queueEvents = new QueueEvents('tasks', { connection });

    this.worker.on('completed', async (job, result) => {
      await this.taskService.updateTaskStatus(job.id as string, TaskStatus.COMPLETED, job.attemptsMade, result);
      // If this was the last step in the workflow, mark execution completed
      const execId = job.data?.executionId;
      const stepIndex = job.data?.stepIndex ?? 0;
      const totalSteps = job.data?.totalSteps ?? 1;
      if (execId && stepIndex === totalSteps - 1) {
        await this.workflowExecService.updateStatus(execId, WorkflowExecutionStatus.COMPLETED);
      }
    });

    this.worker.on('failed', async (job, err) => {
      if (job) {
        await this.taskService.updateTaskStatus(
          job.id as string,
          TaskStatus.FAILED,
          job.attemptsMade,
          { error: err.message },
        );
        const execId = job.data?.executionId;
        if (execId && (job.attemptsMade ?? 0) >= ((job.opts?.attempts as number) ?? 1) - 1) {
          await this.workflowExecService.updateStatus(execId, WorkflowExecutionStatus.FAILED);
        }
      }
    });
  }

  async onModuleDestroy() {
    await Promise.all([this.worker?.close(), this.queueEvents?.close()]);
  }
} 