import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User } from './models/user';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationStart } from '@angular/router';
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
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserFromToken();

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
        localStorage.setItem('accessToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);

        const user: User = response.user;
        this.userSubject.next(user);

      if (user.user_type === 'admin') {
        this.router.navigate(['/admin-home']);
      } else {
        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
        this.router.navigate([redirectUrl]);
        localStorage.removeItem('redirectUrl');
      }
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('redirectUrl');
        this.router.navigate(['/']);
        return throwError(() => error);
      })
    );
  }

  private refreshTokenIfNecessary(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const now = Date.now();
  
      if (expirationTime - now < 60 * 1000) {
        this.refreshToken().subscribe({
          next: () => console.log('Token refreshed successfully'),
          error: () => console.log('Failed to refresh token'),
        });
      }
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
        const user: User = response.user;

        this.userSubject.next(user);
      },
      error: (error) => {
        if (error.status === 401) {
          this.refreshToken().subscribe({
            next: () => {
              this.loadUserFromToken();
            },
            error: () => {
              this.logout();
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
  
        if (response.access && response.refresh) {
          localStorage.setItem('accessToken', response.access);
          localStorage.setItem('refreshToken', response.refresh);
        }
                  
        const user: User = response.user;
  
        this.userSubject.next(user); 
      }),
      catchError((error) => {
        console.error('Registration failed:', error);
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    if (localStorage.getItem('accessToken') === null) {
      return false;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Invalid token:', e);
      return null;
    }
  }
  
  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    return payload ? payload.exp * 1000 < Date.now() : true;
  }
  
  getUserId(): number | null {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); 
      return payload.user_id || null; 
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return null;
    }
  }

  updateUser(updatedUser: Partial<User>): void {
    const currentUser = this.userSubject.value;
    if (!currentUser) return; 
  
    const newUser: User = { ...currentUser, ...updatedUser };
  
    this.userSubject.next(newUser);
  }

  updateUserBalance(newBalance: number): void {
    const currentUser = this.userSubject.value;
    if (currentUser) {
      currentUser.balance = newBalance; 
      this.userSubject.next(currentUser); 
    }
  }

  getUserInfo(): Observable<User> {
    const url = `${this.baseUrl}/user/`;
    const accessToken = localStorage.getItem('accessToken');
  
    if (!accessToken) {
      console.error('No access token found');
      return throwError(() => new Error('No access token found'));
    }
  
    const headers = { Authorization: `Bearer ${accessToken}` };
  
    return this.http.get<User>(url, { headers }).pipe(
      tap((user) => {
        this.userSubject.next(user);
      }),
      catchError((error) => {
        console.error('Error fetching user info:', error);
        return throwError(() => error);
      })
    );
  }
  


}
