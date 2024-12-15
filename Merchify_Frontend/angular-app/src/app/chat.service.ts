import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  // Helper function to get headers with the Authorization token
  private getAuthHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('No access token found');
    }
    return new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
  }

  // Fetch messages with a company
  getMessagesWithCompany(companyId: number): Observable<any> {
    const url = `${this.baseUrl}/chat/company/${companyId}/messages/`;
    const headers = this.getAuthHeaders();
    return this.http.get(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching messages with company:', error);
        return throwError(() => new Error('Failed to fetch messages with company.'));
      })
    );
  }

  // Fetch messages with a user
  getMessagesWithUser(userId: number): Observable<any> {
    const url = `${this.baseUrl}/chat/user/${userId}/messages/`;
    const headers = this.getAuthHeaders();
    return this.http.get(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching messages with user:', error);
        return throwError(() => new Error('Failed to fetch messages with user.'));
      })
    );
  }

  // Send a message based on user type
  sendMessage(id: number, message: string, userType: 'individual' | 'company'): Observable<any> {
    if (!message.trim()) {
      return throwError(() => new Error('Message text cannot be empty.'));
    }

    if (userType === 'individual') {
      return this.sendMessageToCompany(id, message);
    } else if (userType === 'company') {
      return this.sendMessageToUser(id, message);
    } else {
      return throwError(() => new Error('Invalid user type.'));
    }
  }

  // Send a message to a company
  private sendMessageToCompany(companyId: number, message: string): Observable<any> {
    const url = `${this.baseUrl}/chat/company/${companyId}/send/`;
    const headers = this.getAuthHeaders();
    return this.http.post(url, { text: message }, { headers }).pipe(
      catchError((error) => {
        console.error('Error sending message to company:', error);
        return throwError(() => new Error('Failed to send message to the company.'));
      })
    );
  }

  // Send a message to a user
  private sendMessageToUser(userId: number, message: string): Observable<any> {
    const url = `${this.baseUrl}/chat/user/${userId}/send/`;
    const headers = this.getAuthHeaders();
    return this.http.post(url, { text: message }, { headers }).pipe(
      catchError((error) => {
        console.error('Error sending message to user:', error);
        return throwError(() => new Error('Failed to send message to the user.'));
      })
    );
  }

  getChats(): Observable<any> {
    const url = `${this.baseUrl}/chat/`;
    const headers = this.getAuthHeaders();
    return this.http.get(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching chats:', error);
        return throwError(() => new Error('Failed to fetch chats.'));
      })
    );
  }
}
