import { Component } from '@angular/core';
import { Chat } from '../models/chat';
import { ChatService } from '../chat.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-chats',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './list-chats.component.html',
  styleUrl: './list-chats.component.css',
  standalone: true,
})
export class ListChatsComponent {
  chats: Chat[] = [];
  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getChats().subscribe(chats => {
      this.chats = chats;
    });
  }

}
