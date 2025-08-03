import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowEntity } from './workflow.entity';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly repo: Repository<WorkflowEntity>,
  ) {}

  findByName(name: string) {
    return this.repo.findOne({ where: { name } });
  }

  async create(name: string, definition: any) {
    const wf = this.repo.create({ name, definition });
    return this.repo.save(wf);
  }

  async createIfNotExists(name: string, definition: any) {
    let wf = await this.findByName(name);
    if (!wf) {
      wf = await this.create(name, definition);
    }
    return wf;
  }
}
