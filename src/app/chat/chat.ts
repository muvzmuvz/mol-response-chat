// chat.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class ChatComponent implements OnInit, OnDestroy {
  messages: { username: string; text: string; timestamp?: string }[] = [];
  newMessage = '';
  username = '';
  isNamed = false;

  private subscriptions: Subscription[] = [];

  constructor(private chatService: ChatService, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    const username = this.auth.getUsernameFromToken();
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = username;
    this.isNamed = true;

    const newSub = this.chatService.onNewMessage().subscribe((msg) => {
      if (msg) this.messages.push(msg);
    });

    const allSub = this.chatService.onAllMessages().subscribe((msgs) => {
      if (msgs) this.messages = msgs;
    });

    this.chatService.requestMessages();
    this.subscriptions.push(newSub, allSub);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setName() {
    if (this.username.trim()) {
      this.isNamed = true;
      this.chatService.requestMessages(); // только после указания имени
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message = { username: this.username, text: this.newMessage };
    this.chatService.sendMessage(message);
    this.newMessage = '';
  }
}

