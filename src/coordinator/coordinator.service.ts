/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { FlowProducerService } from '../queue/flow-producer.service';
import { TaskEntity } from '../tasks/task.entity';
import { TaskService } from '../tasks/task.service';
import { WorkflowExecutionService } from '../workflows/workflow-execution.service';
import { WorkflowService } from '../workflows/workflow.service';

@Injectable()
export class CoordinatorService {
  constructor(
    private readonly flowProducer: FlowProducerService,
    private readonly taskService: TaskService,
    private readonly workflowService: WorkflowService,
    private readonly workflowExecService: WorkflowExecutionService,
  ) {}

  async executeWorkflow(workflowName: string) {
    const workflow = await this.workflowService.findByName(workflowName);
    if (!workflow) throw new NotFoundException(`Workflow ${workflowName} not found`);

    const execution = await this.workflowExecService.createExecution(workflow);

    const steps: Array<{ taskName: string; data: any }> = workflow.definition.steps || [];
    if (!steps.length) throw new Error('Workflow definition has no steps');

    const nodes: Array<{ task: TaskEntity; data: any }> = [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const dataWithMeta = { ...step.data, executionId: execution.id, stepIndex: i, totalSteps: steps.length };
      const task = await this.taskService.createTask(step.taskName, dataWithMeta, 3);
      nodes.push({ task, data: dataWithMeta });
    }

    let rootNode: any = {
      name: nodes[0].task.name,
      queueName: 'tasks',
      data: nodes[0].data,
      opts: { jobId: nodes[0].task.id, attempts: 3 },
      children: [],
    };
    let current = rootNode;
    for (let i = 1; i < nodes.length; i++) {
      const childNode: any = {
        name: nodes[i].task.name,
        queueName: 'tasks',
        data: nodes[i].data,
        opts: { jobId: nodes[i].task.id, attempts: 3 },
        children: [],
      };
      current.children.push(childNode);
      current = childNode;
    }

    await this.flowProducer.addFlow(rootNode);
    return execution;
  }

  async orchestrateSampleFlow() {
    const ingestionTaskId = await this.createTaskAndReturnId('DataIngestionTask', { source: 's3://bucket/input.csv' });
    const validationTaskId = await this.createTaskAndReturnId('DataValidationTask', {
      dependsOn: ingestionTaskId,
    });

    await this.flowProducer.addFlow({
      name: 'DataIngestionTask',
      queueName: 'tasks',
      data: { source: 's3://bucket/input.csv' },
      opts: { jobId: ingestionTaskId },
      children: [
        {
          name: 'DataValidationTask',
          queueName: 'tasks',
          data: { dependsOn: ingestionTaskId },
          opts: { jobId: validationTaskId },
        },
      ],
    });
  }

  async orchestrateFailingFlow() {
    const enrichmentTaskId = await this.createTaskAndReturnId('DataEnrichmentTask', {});
    const notificationTaskId = await this.createTaskAndReturnId('NotificationDispatchTask', {
      shouldFail: true,
    });

    await this.flowProducer.addFlow({
      name: 'DataEnrichmentTask',
      queueName: 'tasks',
      data: {},
      opts: { jobId: enrichmentTaskId },
      children: [
        {
          name: 'NotificationDispatchTask',
          queueName: 'tasks',
          data: { shouldFail: true },
          opts: {
            jobId: notificationTaskId,
            attempts: 3,
            backoff: { type: 'fixed', delay: 2000 },
          },
        },
      ],
    });
  }

  private async createTaskAndReturnId(name: string, data: any) {
    const task = await this.taskService.createTask(name, data);
    return task.id;
  }
}
