import { Module } from '@nestjs/common';
import { FlowProducerService } from './flow-producer.service';

@Module({
  providers: [FlowProducerService],
  exports: [FlowProducerService],
})
export class QueueModule {} 