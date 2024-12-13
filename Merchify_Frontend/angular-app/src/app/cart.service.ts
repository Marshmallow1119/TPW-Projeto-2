import { Injectable } from '@angular/core';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor() {}
  async getCart(userId: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/cart/${userId}/`, {
        method: 'GET',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao obter carrinho:', error);
      throw error;
    }
  }

  async addToCart(userId: number, productId: number, data: any): Promise<any> {
    console.log(this.baseUrl);
    try {
      console.log('Entrou no add to cart');
      const response = await fetch(`${this.baseUrl}/cart/${userId}/product/${productId}/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro HTTP ${response.status}: ${errorText}`);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
  
      return await response.json();
  
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      throw error;
    }
  }
  

  async updateCartItem(userId: number, itemId: number, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${userId}/${itemId}/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar item do carrinho:', error);
      throw error;
    }
  }

  async removeCartItem(userId: number, itemId: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${userId}/${itemId}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Erro ao remover item do carrinho');
      }
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      throw error;
    }
  }

}
