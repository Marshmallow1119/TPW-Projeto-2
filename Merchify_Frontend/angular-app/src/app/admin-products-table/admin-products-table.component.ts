import { Component, OnInit } from '@angular/core';
import { Product, Vinil, CD, Clothing, Accessory } from '../models/produto';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-admin-products-table',
  templateUrl: './admin-products-table.component.html',
  styleUrls: ['./admin-products-table.component.css'],
})
export class AdminProductsTableComponent implements OnInit {
  products: Product[] = [];
  errorMessage: string | null = null;

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  async fetchProducts(): Promise<void> {
    try {
      this.products = await this.productService.getProducts();
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  isVinil(product: Product): product is Vinil {
    return product.product_type === 'Vinil';
  }

  isCD(product: Product): product is CD {
    return product.product_type === 'CD';
  }

  isClothing(product: Product): product is Clothing {
    return product.product_type === 'Clothing';
  }

  isAccessory(product: Product): product is Accessory {
    return product.product_type === 'Accessory';
  }

  deleteProduct(id): void {
    this.productService.deleteProduct(id);
    this.products = this.products.filter((product) => product.id !== id);
  }
}
