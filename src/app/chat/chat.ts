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
    userId: string;
    username: string;
    text: string;
    timestamp?: string;
    replyTo?: { username: string; text: string; msgIndex: number }[];
    reactions?: { [emoji: string]: number };
  }[] = [];

  newMessage = '';
  username = '';
  userId = '';
  isNamed = false;

  // Новые поля для контекстного меню и выбора сообщений
  contextMenuVisible = false;
  contextMenuPosition = { x: 0, y: 0 };
  contextMenuMessageIndex: number | null = null;

  selectedMessages: Set<number> = new Set();
  showSelectionMode = false;

  // Эмодзи для реакций в контекстном меню
  reactionEmojis: string[] = ['😀', '😂', '😊', '😍', '😎', '😢', '😡', '👍', '🙏', '🎉', '❤️', '🔥', '🌟'];

  typingUsers: Set<string> = new Set();
  array = Array;
  private subscriptions: Subscription[] = [];
  private typingTimeouts: Map<string, any> = new Map();

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private shouldScroll = false;

  replyToList: { username: string; text: string; msgIndex: number }[] = [];
  showReplyButtonIndex: number | null = null;
  highlightedMessageIndex: number | null = null;

  // Помогает перебрать ключи объекта реакций в шаблоне
  objectKeys = Object.keys;

  constructor(private chatService: ChatService, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.auth.logout();
      return;
    }

    const username = this.auth.getUsernameFromToken();
    const userId = this.auth.getUserIdFromToken();
    if (!username || !userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = this.normalizeUsername(username);
    this.userId = userId;
    this.isNamed = true;

    this.subscriptions.push(
      this.chatService.onNewMessage().subscribe((msg) => {
        if (msg) {
          msg.username = this.normalizeUsername(msg.username);
          this.messages.push(msg);
          this.shouldScroll = true;
          this.showReplyButtonIndex = null;
        }
      }),
      this.chatService.onAllMessages().subscribe((msgs) => {
        if (msgs) {
          this.messages = msgs.map(msg => ({
            ...msg,
            username: this.normalizeUsername(msg.username),
          }));
          this.shouldScroll = true;
        }
      }),
      this.chatService.onTyping().subscribe((usernameTyping: any) => {
        let cleanUsername = usernameTyping;

        if (usernameTyping instanceof Uint8Array || usernameTyping instanceof ArrayBuffer) {
          cleanUsername = new TextDecoder('utf-8').decode(
            usernameTyping instanceof Uint8Array
              ? usernameTyping
              : new Uint8Array(usernameTyping)
          );
        }

        cleanUsername = this.normalizeUsername(cleanUsername);

        if (cleanUsername && cleanUsername !== this.username) {
          this.typingUsers.add(cleanUsername);

          if (this.typingTimeouts.has(cleanUsername)) {
            clearTimeout(this.typingTimeouts.get(cleanUsername));
          }

          const timeout = setTimeout(() => {
            this.typingUsers.delete(cleanUsername);
            this.typingTimeouts.delete(cleanUsername);
          }, 3000);

          this.typingTimeouts.set(cleanUsername, timeout);
        }
      })
    );

    this.chatService.requestMessages();

    // Подписка на клик вне контекстного меню для его закрытия
    document.addEventListener('click', this.onDocumentClick.bind(this));
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
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  setName() {
    if (this.username.trim()) {
      this.isNamed = true;
      this.chatService.requestMessages();
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message: any = { username: this.username, userId: this.userId, text: this.newMessage };

    if (this.replyToList.length) {
      message.replyTo = this.replyToList;
    }

    this.chatService.sendMessage(message);
    this.newMessage = '';
    this.replyToList = [];
  }

  onInput() {
    this.chatService.sendTyping(this.username);
  }

  // Открытие контекстного меню при правом клике
  onRightClick(event: MouseEvent, index: number) {
    event.preventDefault();

    // Если сейчас включен режим выбора — показывать контекстное меню НЕ НАД отдельным сообщением, а над кнопкой
    if (this.showSelectionMode) {
      // Скрываем контекстное меню, чтобы не путать пользователя
      this.contextMenuVisible = false;
      return;
    }

    this.contextMenuVisible = true;
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenuMessageIndex = index;
  }

  // Начать режим выбора сообщений (при клике в меню)
  startSelectMessages() {
    this.showSelectionMode = true;
    this.selectedMessages.clear();
    this.closeContextMenu(); // скрыть меню
  }

  // Выбор/снятие выбора сообщения в режиме выбора
  toggleSelectMessage(index: number) {
    if (this.selectedMessages.has(index)) {
      this.selectedMessages.delete(index);
    } else {
      this.selectedMessages.add(index);
    }
  }

  // Завершить режим выбора
  finishSelectMessages() {
    this.showSelectionMode = false;
    this.selectedMessages.clear();
    this.closeContextMenu();
  }

  // Ответить на выбранные сообщения
  replyToSelectedMessages() {
    if (this.selectedMessages.size === 0) return;

    this.replyToList = [];

    this.selectedMessages.forEach(index => {
      const msg = this.messages[index];
      const exists = this.replyToList.find(r => r.text === msg.text && r.username === msg.username);
      if (!exists) {
        this.replyToList.push({ username: msg.username, text: msg.text, msgIndex: index });
      }
    });

    this.showSelectionMode = false;
    this.selectedMessages.clear();
    this.closeContextMenu();
  }

  // Закрываем меню и очищаем выбранные сообщения
  closeContextMenu() {
    this.contextMenuVisible = false;
    this.contextMenuMessageIndex = null;
  }

  // Добавить реакцию эмоджи к сообщению
  addReactionToMessage(emoji: string) {
    if (this.contextMenuMessageIndex === null) return;

    const msg = this.messages[this.contextMenuMessageIndex];

    if (!msg.reactions) {
      msg.reactions = {};
    }

    if (msg.reactions[emoji]) {
      msg.reactions[emoji]++;
    } else {
      msg.reactions[emoji] = 1;
    }

    this.closeContextMenu();
  }

  // Закрываем контекстное меню при клике вне
  onDocumentClick(event: MouseEvent) {
    if (this.contextMenuVisible) {
      this.closeContextMenu();
    }
  }

  replyToMessage(index: number) {
    const msg = this.messages[index];
    const exists = this.replyToList.find(r => r.text === msg.text && r.username === msg.username);
    if (!exists) {
      this.replyToList.push({ username: msg.username, text: msg.text, msgIndex: index });
    }
    this.showReplyButtonIndex = null;
  }

  cancelReply(index: number) {
    this.replyToList.splice(index, 1);
  }

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

  private normalizeUsername(name: string): string {
    if (!name) return '';
    return name.normalize('NFC').trim();
  }

  isMyMessage(msgUserId: string): boolean {
    if (!msgUserId || !this.userId) return false;
    return msgUserId === this.userId;
  }

  showEmojiPicker = false;
  emojis: string[] = ['😀', '😂', '😊', '😍', '😎', '😢', '😡', '👍', '🙏', '🎉', '❤️', '🔥', '🌟'];

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string) {
    this.newMessage += emoji;
    this.showEmojiPicker = false;
  }
}
