import { Injectable, Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoordinatorModule } from '../coordinator/coordinator.module';
import { WorkflowExecutionEntity } from './workflow-execution.entity';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowController } from './workflow.controller';
import { WorkflowEntity } from './workflow.entity';
import { WorkflowService } from './workflow.service';

@Injectable()
class WorkflowSeeder implements OnModuleInit {
  constructor(private readonly wfService: WorkflowService) {}

  async onModuleInit() {
    await this.wfService.createIfNotExists('invoice_pdf', {
      steps: [
        { taskName: 'generateInvoice', data: {} },
        { taskName: 'generatePdf', data: {} },
        { taskName: 'emailGeneration', data: {} }
      ],
    });
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowEntity, WorkflowExecutionEntity]),
    forwardRef(() => CoordinatorModule),
  ],
  providers: [WorkflowService, WorkflowExecutionService, WorkflowSeeder],
  controllers: [WorkflowController],
  exports: [WorkflowService, WorkflowExecutionService, TypeOrmModule],
})
export class WorkflowModule {}
