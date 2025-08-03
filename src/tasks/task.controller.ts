import { Controller, Get, Post } from '@nestjs/common';
import { CoordinatorService } from '../coordinator/coordinator.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly coordinator: CoordinatorService) {}

  @Post('sample-flow')
  async createSampleFlow() {
    await this.coordinator.orchestrateSampleFlow();
    return { message: 'Data Ingestion Flow started...' };
  }

  @Get('sample-flow')
  async createSampleFlowGet() {
    return this.createSampleFlow();
  }

  @Get('sample-failing-flow')
  async createFailingFlow() {
    await this.coordinator.orchestrateFailingFlow();
    return { message: 'Sample failing flow submitted' };
  }
} 