import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../theme.service';
import { ThemeButtonComponent } from '../theme-button/theme-button.component';

@Component({
  selector: 'app-navbar',
  standalone: true, 
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [FormsModule, RouterModule, ThemeButtonComponent],
})
export class NavbarComponent {
  searchQuery: string = '';

  constructor(private router: Router, public themeService: ThemeService) {} 

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
