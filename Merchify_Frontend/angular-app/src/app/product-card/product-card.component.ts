import { Component, Input } from '@angular/core';
import { Product } from '../models/produto';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../favorites.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  imports: [CommonModule, RouterModule],
})
export class ProductCardComponent {
  @Input() product!: Product; 
  @Input() user: any; 
  

  constructor(private favoritesService: FavoritesService, private authService: AuthService, private router: Router) {}
  
  addToCart(product: Product): void {
    console.log('Add to cart:', product);
  }

  toggleFavorite(event: Event, productId: number): void {
    event.preventDefault();
    event.stopPropagation(); 
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.product.is_favorited) {
      this.favoritesService.removeFavorite(productId);
      this.product.is_favorited = false;
    }
    else {
      this.favoritesService.addFavorite(productId);
      this.product.is_favorited = true;
    }
  }
}
