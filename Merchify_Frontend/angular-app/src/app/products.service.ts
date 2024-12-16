import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from './models/produto';
import { CONFIG } from './config';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  baseUrl: string = CONFIG.baseUrl;

  constructor(private router:Router) { }

  //getProduct
  async getProduct(id: number): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/product/${id}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar produto: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  }


  //getProducts
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products: Product[] = await response.json();
      return products.map((product) => ({
        ...product,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/product/${id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });      
    }
    catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  async editProduct(product: Product): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/product/${product.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
    } catch (error) {
      console.error('Error editing product:', error);
    }
  }

  async getFilters(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/filters/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('Fetched filters:', response);
      return await response.json();
    } catch (error) {
      console.error('Error fetching filters:', error);
      return {
        genres: [],
        colors: [],
        sizes: [],
        materials: [],
      };
    }
  }

  async addProduct(product: Product, imageFile: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('product', JSON.stringify(product));
      formData.append('image', imageFile);
      const response = await fetch(`${this.baseUrl}/products/`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Failed to add product: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }
  

  async updateProductStock(productId: number, body: any): Promise<any> {
    const token = localStorage.getItem('accessToken'); 
    if (!token) {
      throw new Error('Access token not found');
    }
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}/stock/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error('Failed to update product stock');
      }
      return await response.json();
    } catch (error) {

  }
}
  
}
