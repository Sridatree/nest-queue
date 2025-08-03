import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { FlowProducer } from 'bullmq';
import IORedis from 'ioredis';
import { redisOptions } from '../config/redis.config';

@Injectable()
export class FlowProducerService implements OnModuleDestroy {
  private readonly flowProducer: FlowProducer;

  constructor() {
    this.flowProducer = new FlowProducer({
      connection: new IORedis(redisOptions),
    });
  }

  async addFlow(flow: any) {
    return this.flowProducer.add(flow);
  }

  async onModuleDestroy() {
    await this.flowProducer.close();
  }
} 