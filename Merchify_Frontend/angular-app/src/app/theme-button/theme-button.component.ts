import { Component } from '@angular/core';
import { ThemeService } from '../theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-button',
  imports: [CommonModule],
  templateUrl: './theme-button.component.html',
  styleUrl: './theme-button.component.css'
})
export class ThemeButtonComponent {
  constructor(public themeService: ThemeService) {} // Inject the ThemeService
  toggleTheme(): void {
    this.themeService.toggleTheme(); // Call the ThemeService toggle method
  }
}
