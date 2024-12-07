import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule, RouterLink],
  providers: [AuthService],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        this.errorMessage = null; // Clear any previous error messages
        localStorage.setItem('accessToken', response.access); // Save tokens
        localStorage.setItem('refreshToken', response.refresh);

        // Navigate based on user_type
        switch (response.user_type) {
          case 'individual':
            this.router.navigate(['/']);
            break;
          case 'company':
            this.router.navigate(['/company-products']);
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
        this.errorMessage =
          err.error?.error || 'Login failed. Please try again.';
      },
    });
  }
}
