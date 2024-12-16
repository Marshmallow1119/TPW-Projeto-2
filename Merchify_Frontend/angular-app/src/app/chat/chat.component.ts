import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { User } from '../models/user';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  recipientId: number | undefined; // Can be a companyId or userId
  userType: 'individual' | 'company' | 'admin' | undefined; // Determines the type of the current user
  isLoading: boolean = false;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe(
      (user: User) => {
        this.userType = user.user_type as 'individual' | 'company' | 'admin'; // Explicitly cast
        console.log('User type:', this.userType);
  
        this.recipientId = +this.route.snapshot.paramMap.get('id')!;
        this.fetchMessages();
      },
      (error) => {
        console.error('Failed to fetch user info:', error);
      }
    );
  }

  fetchMessages(): void {
    if (!this.recipientId || !this.userType) return;

    this.isLoading = true;
    if (this.userType === 'individual') {
      this.chatService.getMessagesWithCompany(this.recipientId).subscribe(
        (response: any) => {
          this.messages = response.messages;
          this.isLoading = false;
          console.log(this.messages);

        },
        (error) => {
          console.error('Error fetching messages:', error);
          this.isLoading = false;
        }
      );
    } else if (this.userType === 'company') {
      this.chatService.getMessagesWithUser(this.recipientId).subscribe(
        (response: any) => {
          this.messages = response.messages;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching messages:', error);
          this.isLoading = false;
        }
      );
    }
  }

  sendMessage(): void {
    console.log('Sending message:', this.newMessage);
    console.log('User type:', this.userType);

    if (!this.newMessage.trim() || !this.recipientId || (this.userType !== 'individual' && this.userType !== 'company')) return;

    this.chatService.sendMessage(this.recipientId, this.newMessage, this.userType).subscribe(
      (response) => {
        console.log('Message sent:', response);
        this.messages.push(response.message);
        this.newMessage = '';
      },
      (error) => {
        console.error('Error sending message:', error);
      }
    );
  }
}
