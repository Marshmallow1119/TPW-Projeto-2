import { Component, Input, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';
import { Product } from '../models/produto';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true, // Enable standalone component
  imports: [CommonModule, RouterModule],
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product; // Product passed to this component
  products: Product[] = []; // Array to hold fetched products
  @Input() user: any; // Add user input

  // Add the missing addToCart method
  addToCart(product: Product): void {
    console.log('Add to cart:', product);
  }


  constructor(private productsService: ProductsService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.products = await this.productsService.getProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }
}
