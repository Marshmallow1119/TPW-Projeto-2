import { Component, Input } from '@angular/core';
import { Product } from '../models/produto';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../favorites.service';
import { AuthService } from '../auth.service';
import { User } from '../models/user';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  imports: [CommonModule, RouterModule],
})
export class ProductCardComponent {
  @Input() product!: Product; 
  @Input() user: User | null = null;
  userType: string = '';
  isAuthenticaded: boolean = false;


  constructor(private favoritesService: FavoritesService, private authService: AuthService, private router: Router) {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (this.authService.isAuthenticated()) {
        this.isAuthenticaded = true;
        this.userType = user?.user_type || '';
      }
    });
    
  }
  
  addToCart(product: Product): void {
    console.log('Add to cart:', product);
  }

  toggleFavorite(event: Event, productId: number): void {
    event.preventDefault();
    event.stopPropagation(); 
    console.log('user', this.user);
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
