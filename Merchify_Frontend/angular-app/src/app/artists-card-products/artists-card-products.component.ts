import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-artists-card-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artists-card-products.component.html',
  styleUrls: ['./artists-card-products.component.css'],
})
export class ArtistsCardProductsComponent {
  @Input() products: any[] = []; // Lista de produtos
  @Input() isAuthenticated: boolean = false; // Indica se o usuário está autenticado
  @Input() user: any = null; // Dados do usuário
  @Output() favoriteToggled = new EventEmitter<number>(); // Evento para favoritar produtos

  toggleFavorite(productId: number): void {
    this.favoriteToggled.emit(productId);
  }

  addToCart(product: any): void {
    console.log(`Adicionado ao carrinho:`, product);
  }
}
