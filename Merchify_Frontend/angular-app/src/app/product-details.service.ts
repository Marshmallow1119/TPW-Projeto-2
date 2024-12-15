import { Injectable } from '@angular/core';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailsService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor() {}

  async getProductDetails(productId: number): Promise<any> {
    const url = `${this.baseUrl}/product/${productId}/`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch product details: ${response.statusText}`);
      }

      const product = await response.json();
      if (product.image) {
        product.image = `${this.baseUrl}${product.image}`;
      }

      return product;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw new Error('Unable to load product details. Please try again later.');
    }
  }
}
