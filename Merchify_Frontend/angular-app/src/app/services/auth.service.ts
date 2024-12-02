import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  getUserInfo(): Observable<any> {
    // Mocked user data - Replace with actual HTTP request
    return of({
      isAuthenticated: true,
      username: 'User123',
      userType: 'individual', // Can be 'individual', 'admin', or 'company'
      company: { id: 'company123' }, // For company userType
    });
  }

  logout(): void {
    // Clear user session - Replace with actual logic
    localStorage.removeItem('authToken');
    sessionStorage.clear();
  }
}
