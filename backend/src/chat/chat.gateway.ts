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

// Функция исправления кодировки (если нужно)
function fixEncoding(str: string): string {
  return Buffer.from(str, 'latin1').toString('utf8');
}

@WebSocketGateway({
  cors: { origin: '*' }, // Для разработки разрешаем все
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

      const userId = payload.sub;   // ID пользователя из JWT
      const username = payload.username.normalize('NFC'); // Имя пользователя

      (client as any).user = {
        id: userId,
        username,
        role: payload.role,
      };

      console.log(`Client connected: ${client.id}, userId: ${userId}, username: ${username}`);
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
      userId: user.id,
    };

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
    const fixedUsername = fixEncoding(username);

    // Просто нормализуем и убираем пробелы по краям, не трогаем остальное
    const normalizedUsername = fixedUsername.normalize('NFC').trim();

    if (normalizedUsername) {
      client.broadcast.emit('typing', normalizedUsername);
    }
  }
}
