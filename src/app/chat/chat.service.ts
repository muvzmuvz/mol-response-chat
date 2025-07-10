// chat.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket!: Socket;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.socket = io('http://192.168.0.174:3000', {
        transports: ['websocket'],
        query: {
          token: localStorage.getItem('access_token') || '',
        },
      });

      this.socket.on('connect', () => {
        console.log('WebSocket подключён:', this.socket.id);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Ошибка WebSocket:', error);
        // Попытка переподключения с новым токеном
        setTimeout(() => {
          this.socket.io.opts.query = {
            token: localStorage.getItem('access_token') || ''
          };
          this.socket.connect();
        }, 1000);
      });
    }
  }

  sendMessage(data: { username: string; text: string }) {
    if (this.isBrowser) {
      this.socket.emit('sendMessage', data);
    }
  }

  requestMessages() {
    if (this.isBrowser) {
      this.socket.emit('getMessages');
    }
  }

  sendTyping(username: string) {
    if (this.isBrowser) {
      this.socket.emit('typing', username);
    }
  }

  onNewMessage(): Observable<any> {
    return new Observable(observer => {
      if (this.isBrowser) {
        this.socket.on('newMessage', (data) => {
          observer.next(data);
        });
      }

      return () => {
        if (this.isBrowser) this.socket.off('newMessage');
      };
    });
  }

  onAllMessages(): Observable<any[]> {
    return new Observable(observer => {
      if (this.isBrowser) {
        this.socket.on('allMessages', (data) => {
          observer.next(data);
        });
      }

      return () => {
        if (this.isBrowser) this.socket.off('allMessages');
      };
    });
  }

  onTyping(): Observable<string> {
    return new Observable(observer => {
      if (this.isBrowser) {
        this.socket.on('typing', (username: string) => {
          observer.next(username);
        });
      }

      return () => {
        if (this.isBrowser) this.socket.off('typing');
      };
    });
  }
}
