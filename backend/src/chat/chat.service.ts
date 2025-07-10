// chat.service.ts
import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';

interface StoredMessage extends MessageDto {
  id: number;
  timestamp: string;
}

@Injectable()
export class ChatService {
  private messages: StoredMessage[] = [];
  private idCounter = 1;

  saveMessage(msg: MessageDto): StoredMessage {
    const newMessage: StoredMessage = {
      ...msg,
      id: this.idCounter++,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  getAllMessages(): StoredMessage[] {
    return this.messages;
  }
}
