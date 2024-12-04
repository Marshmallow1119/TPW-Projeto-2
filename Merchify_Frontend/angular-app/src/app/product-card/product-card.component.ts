import { Component, Input } from '@angular/core';
import { Product } from '../models/produto';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  imports: [CommonModule,RouterModule],
})
export class ProductCardComponent {
  @Input() product!: Product; 
  @Input() user: any; 

  // Add to cart method
  addToCart(product: Product): void {
    console.log('Add to cart:', product);
  }

  toggleFavorite(productId: number): void {
    console.log('Toggle favorite for product ID:', productId);
  }
}
