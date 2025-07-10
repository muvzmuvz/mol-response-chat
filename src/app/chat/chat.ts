import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService } from './chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../service/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.html',
  styleUrls: ['./chat.less'],
  imports: [FormsModule, CommonModule]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  messages: {
    username: string;
    text: string;
    timestamp?: string;
    replyTo?: { username: string; text: string; msgIndex: number }[]  // теперь с индексом сообщения
  }[] = [];

  newMessage = '';
  username = '';
  isNamed = false;

  typingUsers: Set<string> = new Set();
  array = Array;
  private subscriptions: Subscription[] = [];
  private typingTimeout?: any;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private shouldScroll = false;

  // Массив с ответами (цитатами) для отправки
  replyToList: { username: string; text: string; msgIndex: number }[] = [];
  showReplyButtonIndex: number | null = null;

  // Индекс сообщения, которое подсвечено
  highlightedMessageIndex: number | null = null;

  constructor(private chatService: ChatService, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    const username = this.auth.getUsernameFromToken();
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = username;
    this.isNamed = true;

    this.subscriptions.push(
      this.chatService.onNewMessage().subscribe((msg) => {
        if (msg) {
          this.messages.push(msg);
          this.shouldScroll = true;
          this.showReplyButtonIndex = null;
        }
      }),
      this.chatService.onAllMessages().subscribe((msgs) => {
        if (msgs) {
          this.messages = msgs;
          this.shouldScroll = true;
        }
      }),
      this.chatService.onTyping().subscribe((usernameTyping: string) => {
        if (usernameTyping && usernameTyping !== this.username) {
          this.typingUsers.add(usernameTyping);
          clearTimeout(this.typingTimeout);
          this.typingTimeout = setTimeout(() => {
            this.typingUsers.delete(usernameTyping);
          }, 3000);
        }
      })
    );

    this.chatService.requestMessages();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.warn('Не удалось проскроллить вниз', err);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    clearTimeout(this.typingTimeout);
  }

  setName() {
    if (this.username.trim()) {
      this.isNamed = true;
      this.chatService.requestMessages();
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message: any = { username: this.username, text: this.newMessage };

    if (this.replyToList.length) {
      message.replyTo = this.replyToList;
    }

    this.chatService.sendMessage(message);
    this.newMessage = '';
    this.replyToList = []; // очищаем цитаты после отправки
  }

  onInput() {
    this.chatService.sendTyping(this.username);
  }

  onRightClick(event: MouseEvent, index: number) {
    event.preventDefault();
    this.showReplyButtonIndex = index;
  }

  // Добавляем новое сообщение в массив цитат (если его там нет)
  replyToMessage(index: number) {
    const msg = this.messages[index];
    const exists = this.replyToList.find(r => r.text === msg.text && r.username === msg.username);
    if (!exists) {
      this.replyToList.push({ username: msg.username, text: msg.text, msgIndex: index });
    }
    this.showReplyButtonIndex = null;
  }

  // Удаляем цитату из списка по индексу
  cancelReply(index: number) {
    this.replyToList.splice(index, 1);
  }

  // Скроллим к сообщению по индексу и подсвечиваем его
  scrollToMessage(index: number) {
    const element = document.getElementById('msg-' + index);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      this.highlightedMessageIndex = index;

      setTimeout(() => {
        this.highlightedMessageIndex = null;
      }, 3000);
    }
  }
}