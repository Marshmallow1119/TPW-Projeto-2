import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterModule],  templateUrl: './navbar.component.html', 
  styleUrls: ['./navbar.component.css'], 
})
export class NavbarComponent {
  searchQuery: string = '';

  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      alert('Por favor, insira o que pretende pesquisar.');
      return;
    }
    console.log('Pesquisa realizada para:', this.searchQuery);
  }
}
