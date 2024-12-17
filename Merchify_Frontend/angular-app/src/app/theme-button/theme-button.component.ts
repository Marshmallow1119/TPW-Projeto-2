import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-button',
  imports: [CommonModule],
  templateUrl: './theme-button.component.html',
  styleUrl: './theme-button.component.css'
})
export class ThemeButtonComponent implements OnInit {
  constructor(public themeService: ThemeService) {} 
  toggleTheme(): void {
    this.themeService.toggleTheme(); 
  }

  ngOnInit(): void {
    if (localStorage.getItem('isDarkMode')) {
      const theme = localStorage.getItem('isDarkMode');
      if (theme) {
        this.themeService.loadTheme();
      }
    }
  }
}
