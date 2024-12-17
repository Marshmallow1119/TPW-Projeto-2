import { ChangeDetectorRef, Component } from '@angular/core';
import { Chat } from '../models/chat';
import { ChatService } from '../chat.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../models/user';
import { AuthService } from '../auth.service';
import { response } from 'express';

@Component({
  selector: 'app-list-chats',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './list-chats.component.html',
  styleUrl: './list-chats.component.css',
  standalone: true,
})
export class ListChatsComponent {
  chats: Chat[] = [];
  user: User | null = null;
  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe(user => {
      this.user = user;
      console.log('ListChatsComponent received user:', user);
      if (this.user) {
        if (this.user.user_type === 'individual') {
          this.chatService.getChats(user.id, user.user_type).subscribe(response => {
            this.chats = response.chats;
            console.log('chats:', this.chats);
          });
        }
        else if (this.user.user_type === 'company' && this.user.company) {
          const company = this.user.company.id;
          this.chatService.getChats(company, user.user_type).subscribe(response => {
            this.chats = response.chats;
            console.log('chats:', this.chats);
          });
        }
      }
    });
  }
}
