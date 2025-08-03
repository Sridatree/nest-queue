import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkflowExecutionEntity,
  WorkflowExecutionStatus,
} from './workflow-execution.entity';
import { WorkflowEntity } from './workflow.entity';

@Injectable()
export class WorkflowExecutionService {
  constructor(
    @InjectRepository(WorkflowExecutionEntity) private readonly repo: Repository<WorkflowExecutionEntity>,
  ) {}

  createExecution(workflow: WorkflowEntity) {
    const exec = this.repo.create({ workflow });
    return this.repo.save(exec);
  }

  async updateStatus(id: string, status: WorkflowExecutionStatus) {
    await this.repo.update(id, { status });
    return this.repo.findOne({ where: { id } });
  }
}
