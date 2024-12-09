import { Component, OnInit, ChangeDetectorRef, Inject, Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../models/user';
import { ThemeButtonComponent } from '../theme-button/theme-button.component';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [ThemeButtonComponent, RouterModule, CommonModule, FormsModule],
})
export class NavbarComponent implements OnInit {
  searchQuery: string = '';
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      console.log('NavbarComponent received user:', user);
      this.user = user;
      this.cdr.detectChanges();
    });
  }

  logout(): void {
    this.authService.logout();
  }

  onKeyUp(): void {
    if (this.searchQuery.trim().length > 0) {
      this.router.navigate(['/search-results'], {
        queryParams: { query: this.searchQuery },
      });
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim().length > 0) {
      this.router.navigate(['/search-results'], {
        queryParams: { query: this.searchQuery },
      });
    }
  }
}
