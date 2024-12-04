import { Injectable } from '@angular/core';
import { Product } from './models/produto';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private baseUrl = 'http://localhost:8000/ws/';

  constructor() {}

  // Fetch a single product
  async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${this.baseUrl}produtos/${id}`);
    const product: Product = await response.json();
    return this.processProduct(product);
  }

  // Fetch all products
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}produtos/`);
    const products: Product[] = await response.json();
    return products.map(this.processProduct);
  }

  // Process product data (e.g., convert base64 image to blob)
  private processProduct(product: Product): Product {
    if (product.image) {
      const blob = this.base64toBlob(product.image, 'image/png');
      product.image = URL.createObjectURL(blob);
    }
    return product;
  }

  // Utility function to convert base64 string to Blob
  private base64toBlob(base64: string, type: string): Blob {
    const binary = atob(base64.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type });
  }
}
