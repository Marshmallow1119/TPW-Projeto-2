import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, NavbarComponent, FooterComponent, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthService]
})
export class AppComponent implements OnInit {
  title = 'Merchify';
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    this.authService.loadUserFromToken();
  }
}
