import { Controller, Post, Body, Param } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CoordinatorService } from '../coordinator/coordinator.service';

@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly coordinator: CoordinatorService,
  ) {}

  @Post()
  createWorkflow(@Body() body: { name: string; definition: any }) {
    return this.workflowService.create(body.name, body.definition);
  }

  @Post(':name/execute')
  async execute(@Param('name') name: string) {
    const exec = await this.coordinator.executeWorkflow(name);
    return { executionId: exec.id, status: exec.status };
  }
}
