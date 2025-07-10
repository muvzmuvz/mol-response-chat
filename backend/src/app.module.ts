import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { JwtModule } from '@nestjs/jwt'

import { RouteModule } from './route/route.module';
import { ClientModule } from './clients/client.module';
import { HistoryModule } from './history/history.module';
import { TasksModule } from './tasks/tasks.module';
import { ChatModule } from './chat/chat.module'; // 🆕 Подключаем модуль чата
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(process.cwd(), 'data', 'db.sqlite'),
      entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
      synchronize: true,

    }),
    ScheduleModule.forRoot(),
    RouteModule,
    ClientModule,
    HistoryModule,
    TasksModule,
    ChatModule,
    AuthModule,
    JwtModule.register({
      secret: 'supersecret',
      signOptions: { expiresIn: '15m' },
    }), // 🆕 Подключение ChatModule
  ],
})
export class AppModule {
  constructor() {
    const path = join(process.cwd(), 'data');
    if (!existsSync(path)) mkdirSync(path);
  }
}
