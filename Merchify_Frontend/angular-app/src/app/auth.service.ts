import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User } from './models/user';
import { isPlatformBrowser } from '@angular/common';
import { ReplaySubject } from 'rxjs';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null); // Initialize with null
  user$ = this.userSubject.asObservable();
  private baseUrl: string = CONFIG.baseUrl;
  
  private registerUrl =  this.baseUrl + '/register/';
  private validateTokenUrl = this.baseUrl + '/token/validate/';
  private loginUrl = this.baseUrl + '/login/';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserFromToken();
    }
  
    this.user$.subscribe((user) => {
      console.log('AuthService user$ Emission:', user);
    });
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
  
  
  loadUserFromToken(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
  
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }
  
    this.http.post(this.validateTokenUrl, { token }).subscribe({
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
      error: () => {
        this.logout();
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
  
}