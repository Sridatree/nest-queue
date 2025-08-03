import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity, TaskStatus } from './task.entity';

@Injectable()
export class TaskService {
  constructor(@InjectRepository(TaskEntity) private readonly repo: Repository<TaskEntity>) {}

  async createTask(name: string, data: any, maxAttempts = 5) {
    const executionId = data?.executionId;
    const task = this.repo.create({ name, data, maxAttempts, executionId });
    return this.repo.save(task);
  }

  async updateTaskStatus(id: string, status: TaskStatus, attemptsMade?: number, result?: any) {
    const update: Partial<TaskEntity> = { status };
    if (attemptsMade !== undefined) update.attemptsMade = attemptsMade;
    if (result !== undefined) update.result = result;
    await this.repo.update(id, update);
    return this.repo.findOne({ where: { id } });
  }
} 