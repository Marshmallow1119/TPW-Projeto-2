import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for *ngIf, *ngSwitch
import { RouterModule } from '@angular/router'; // Required for [routerLink]

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add required modules here
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  user: { isAuthenticated: boolean; username: string; userType: string; company?: { id: string } } | null = {
    isAuthenticated: true,
    username: 'JohnDoe',
    userType: 'individual',
  };

  constructor() {}

  logout(): void {
    this.user = null;
    console.log('User logged out'); // Replace with real logout logic
  }

  search(query: string): void {
    if (query.trim()) {
      console.log('Search for:', query); // Replace with real search logic
    }
  }

  isActive(route: string): boolean {
    return false; // Replace with real logic if needed
  }
}
