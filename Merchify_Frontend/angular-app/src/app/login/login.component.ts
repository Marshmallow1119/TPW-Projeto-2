import { Component, Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule, RouterLink],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        this.errorMessage = null;
        localStorage.setItem('accessToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        console.log('User type:', response.user.user_type);
  
        if (localStorage.getItem('redirectUrl') && response.user.user_type === 'individual') {
          const redirectUrl = localStorage.getItem('redirectUrl');
          localStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
          return;
        }
  
        switch (response.user.user_type) {
          case 'individual':
            this.router.navigate(['/']);
            break;
          case 'company':
            this.router.navigate(['/my-company-products/' + response.user.company.id]);
            break;
          case 'admin':
            this.router.navigate(['/admin-home']);
            break;
          default:
            this.router.navigate(['/']);
            break;
        }
      },
      error: (err) => {
        if (err.status === 403) {
          this.errorMessage = 'Your account has been banned. Please contact support.';
        } else {
          this.errorMessage = err.error?.error || 'Login failed. Please try again.';
        }
      },
    });
  }
  
}
