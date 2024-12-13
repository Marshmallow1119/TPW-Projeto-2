import { Component, Input } from '@angular/core';
import { Product } from '../models/produto';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../favorites.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  imports: [CommonModule, RouterModule],
})
export class ProductCardComponent {
  @Input() product!: Product; 
  @Input() user: any; 

  isProcessing: boolean = false; // Indica se uma operação está em andamento

  constructor(private favoritesService: FavoritesService) {}

  addToCart(product: Product): void {
    console.log('Add to cart:', product);
  }

  async toggleFavorite(productId: number): Promise<void> {
    if (!this.user?.is_authenticated) {
      console.error('Usuário não autenticado.');
      alert('Você precisa estar logado para favoritar um produto.');
      return;
    }

    if (this.isProcessing) {
      return; 
    }

    this.isProcessing = true;

    try {
      if (this.product.is_favorited) {
        await this.favoritesService.removeFavorite(productId);
        this.product.is_favorited = false;
        console.log(`Produto ${productId} removido dos favoritos.`);
      } else {
        await this.favoritesService.addFavorite(productId);
        this.product.is_favorited = true;
        console.log(`Produto ${productId} adicionado aos favoritos.`);
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      alert('Ocorreu um erro ao tentar alterar o status de favorito.');
    } finally {
      this.isProcessing = false;
    }
  }
}
