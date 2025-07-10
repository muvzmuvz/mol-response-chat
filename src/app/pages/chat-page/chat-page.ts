import { Component } from '@angular/core';
import { ChatComponent } from "../../chat/chat";
import { Navbar } from "../../components/navbar/navbar";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-page',
  imports: [ChatComponent, Navbar,FormsModule,CommonModule],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.less'
})
export class ChatPage {

}
