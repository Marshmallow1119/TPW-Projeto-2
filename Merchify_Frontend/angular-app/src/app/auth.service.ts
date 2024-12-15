import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User } from './models/user';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationStart } from '@angular/router'; // Import Router and NavigationStart
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private baseUrl: string = CONFIG.baseUrl;

  private registerUrl = this.baseUrl + '/register/';
  private validateTokenUrl = this.baseUrl + '/token/validate/';
  private loginUrl = this.baseUrl + '/login/';
  private refreshTokenUrl = this.baseUrl + '/token/refresh/';

  constructor(
    private http: HttpClient,
    private router: Router, // Inject Router
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserFromToken();

      // Listen to router events to refresh token on navigation
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.refreshTokenIfNecessary();
        }
      });
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl, { username, password }).pipe(
      tap((response: any) => {
        if (!response.access || !response.refresh) {
          throw new Error('Missing tokens in the response');
        }

        const user: User = {
          id: response.id || 0,
          username,
          firstname: response.firstname,
          lastname: response.lastname,
          user_type: response.user_type,
          address: response.address,
          email: response.email,
          phone: response.phone,
          country: response.country,
          number_of_purchases: response.number_of_purchases || 0,
        };

        this.userSubject.next(user);
        localStorage.setItem('accessToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post(this.refreshTokenUrl, { refresh: refreshToken }).pipe(
      tap((response: any) => {
        if (!response.access) {
          throw new Error('Missing access token in the refresh response');
        }
        localStorage.setItem('accessToken', response.access);
      }),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private refreshTokenIfNecessary(): void {
    const token = localStorage.getItem('accessToken');
    if (!token || this.isTokenExpired(token)) {
      this.refreshToken().subscribe({
        next: () => console.log('Token refreshed successfully'),
        error: () => console.log('Failed to refresh token'),
      });
    }
  }

  loadUserFromToken(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }

    this.http.post(this.validateTokenUrl,  { token }).subscribe({
      next: (response: any) => {
        const user: User = {
          id: response.id || 0,
          username: response.username,
          user_type: response.user_type,
          number_of_purchases: response.number_of_purchases || 0,
          firstname: response.firstname,
          lastname: response.lastname,
          address: response.address,
          email: response.email,
          phone: response.phone,
          country: response.country,
        };

        this.userSubject.next(user);
      },
      error: (error) => {
        if (error.status === 401) {
          console.log('Access token expired, attempting to refresh');
          this.refreshToken().subscribe({
            next: () => {
              console.log('Token refreshed successfully');
              this.loadUserFromToken();
            },
            error: () => {
              console.log('Token refresh failed');
            },
          });
        } else {
          this.logout();
        }
      },
    });
  }

  logout(): void {
    this.userSubject.next(null);
    if (isPlatformBrowser(this.platformId) && this.isLocalStorageAvailable()) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  register(formData: FormData): Observable<any> {
    return this.http.post(this.registerUrl, formData).pipe(
      tap((response: any) => {
        console.log('Register response:', response);
  
        if (response.access && response.refresh) {
          localStorage.setItem('accessToken', response.access);
          localStorage.setItem('refreshToken', response.refresh);
  
          const user: User = {
            id: response.id,
            username: response.username,
            user_type: response.user_type,
            number_of_purchases: 0,
            firstname: response.firstname,
            lastname: response.lastname,
            address: response.address,
            email: response.email,
            phone: response.phone,
            country: response.country,

          };
  
          this.userSubject.next(user); 
          console.log('User registered and logged in:', user);
        }
      }),
      catchError((error) => {
        console.error('Registration failed:', error);
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return false;
    }

    return !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      console.error('Error checking token expiration:', e);
      return true;
    }
  }
  getUserId(): number | null {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload do JWT
      return payload.user_id || null; // Retorne o ID do usuário se existir no payload
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return null;
    }
  }

  getUserInfo(): Observable<User> {
    const url = `${this.baseUrl}/user/`; // Endpoint URL
    const accessToken = localStorage.getItem('accessToken');
  
    if (!accessToken) {
      console.error('No access token found');
      return throwError(() => new Error('No access token found'));
    }
  
    const headers = { Authorization: `Bearer ${accessToken}` };
  
    return this.http.get<User>(url, { headers }).pipe(
      tap((user) => {
        console.log('User info:', user);
        this.userSubject.next(user);
      }),
      catchError((error) => {
        console.error('Error fetching user info:', error);
        return throwError(() => error);
      })
    );
  }
  


}
