import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ClientModule } from '../clients/client.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [ClientModule, HistoryModule],
  providers: [TasksService],
})
export class TasksModule {}
