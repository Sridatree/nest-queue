import { WorkflowExecutionEntity } from 'src/workflows/workflow-execution.entity';
import { WorkflowEntity } from 'src/workflows/workflow.entity';
import { DataSourceOptions } from 'typeorm';
import { TaskEntity } from '../tasks/task.entity';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'queue_poc',
  entities: [TaskEntity, WorkflowEntity, WorkflowExecutionEntity],
  synchronize: true, // DO NOT use synchronize in production
}; 