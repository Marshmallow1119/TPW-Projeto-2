import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FavoritesService } from '../favorites.service';
import { AuthService } from '../auth.service';
import { Product } from '../models/produto';

@Component({
  selector: 'app-artists-card-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artists-card-products.component.html',
  styleUrls: ['./artists-card-products.component.css'],
})
export class ArtistsCardProductsComponent {
  @Input() products: Product[] = [];
  @Input() isAuthenticated: boolean = false;
  @Input() user: any = null; 
  @Output() favoriteToggled = new EventEmitter<number>(); 
  isAuthenticaded: boolean = true;

  constructor(private favoriteService: FavoritesService, private router: Router, private authService: AuthService) {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (this.authService.isAuthenticated()) {
        this.isAuthenticaded = true;
      }
    });
  }

  toggleFavorite(event: Event, productId: number): void {
    event.preventDefault();
    event.stopPropagation(); 
    console.log('user', this.user);
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
    const product = this.products.find(p => p.id === productId);
    if (product) {
      if (product.is_favorited) {
        this.favoriteService.removeFavorite(productId);
        product.is_favorited = false;
      } else {
        this.favoriteService.addFavorite(productId);
        product.is_favorited = true;
      }
    }
    }

  addToCart(product: any): void {
    console.log(`Adicionado ao carrinho:`, product);
  }
}
