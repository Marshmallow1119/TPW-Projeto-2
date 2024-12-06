import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadTheme();
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
}
