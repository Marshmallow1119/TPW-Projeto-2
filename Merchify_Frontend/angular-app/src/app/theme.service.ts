import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;
  private currentTheme = new BehaviorSubject<string>('default'); // Default theme
  theme$ = this.currentTheme.asObservable(); // Observable for components to subscribe to

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadTheme();
    this.loadThemeFromStorage(); // Load theme on initialization
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
  }

  getTheme(): boolean {
    return this.isDarkMode;
  }

  private applyTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
      localStorage.setItem('isDarkMode', this.isDarkMode.toString());
    }
  }

  private loadTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedTheme = localStorage.getItem('isDarkMode');
      this.isDarkMode = storedTheme === 'true';
      this.applyTheme();
    }
  }

  getCurrentTheme(): string {
    console.log('Current theme:', this.currentTheme.value);
    return this.currentTheme.value;
  }

  changeTheme(theme: string): void {
    this.currentTheme.next(theme); // Notify subscribers
    // Apply the theme to the body
    if (isPlatformBrowser(this.platformId)) {
      //quero que verifique primeiro o dark-theme e depois o theme
      
      document.body.className = ''; // Clear existing theme classes
      document.body.classList.add(`theme-${theme}`); // Add new theme class
      localStorage.setItem('theme', theme); // Save theme in localStorage
    }
  }

  private loadThemeFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedTheme = localStorage.getItem('theme') || 'default';
      this.changeTheme(storedTheme); // Apply the stored theme
    }
  }
}
