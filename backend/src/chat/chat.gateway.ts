// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageDto } from './dto/message.dto';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from './ws-auth.guard';

// Функция для исправления возможной неправильной кодировки строки
function fixEncoding(str: string): string {
  // Перекодируем из latin1 (искажённые байты) в utf8
  return Buffer.from(str, 'latin1').toString('utf8');
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      if (!token) throw new Error('Token not provided');

      const payload = this.jwtService.verify(token);

      // НЕ перекодируем username здесь, используем как есть
      const username = payload.username;

      (client as any).user = {
        id: payload.sub,
        username,
        role: payload.role,
      };

      console.log(`Client connected: ${client.id}, user: ${username}`);
    } catch (e) {
      console.log('Token validation error:', e.message);
      client.emit('error', 'Authentication failed');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() message: MessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;

    const messageWithUser = {
      ...message,
      username: user.username,
    };

    console.log('Отправляем сообщение от:', user.username, 'текст:', message.text);

    const saved = await this.chatService.saveMessage(messageWithUser);
    this.server.emit('newMessage', saved);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('getMessages')
  async handleGetMessages(@ConnectedSocket() client: Socket) {
    const messages = await this.chatService.getAllMessages();
    client.emit('allMessages', messages);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() username: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Получено событие typing (исходные данные): ${username} тип: ${typeof username}`);

    // Перекодируем только тут — потому что от клиента приходит в искажённой кодировке
    const fixedUsername = fixEncoding(username);

    console.log(`Исправленное имя пользователя для typing: ${fixedUsername}`);

    client.broadcast.emit('typing', fixedUsername);

    console.log(`Отправлено событие typing всем остальным: ${fixedUsername}`);
  }
}
