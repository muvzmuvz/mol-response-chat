import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { WsAuthGuard } from './ws-auth.guard';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: 'supersecret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [ChatGateway, ChatService, WsAuthGuard],
})
export class ChatModule { }