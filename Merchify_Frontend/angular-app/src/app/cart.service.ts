import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8000/ws/cart/';

  constructor() {}

  async getCart(userId: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}${userId}/`, {
        method: 'GET',
        credentials: 'include', // Enviar cookies (se necessário)
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
    try {
      const response = await fetch(`${this.apiUrl}${userId}/${productId}/`, {
        method: 'POST',
        credentials: 'include', // Enviar cookies (se necessário)
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      throw error;
    }
  }

  async updateCartItem(userId: number, itemId: number, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}${userId}/${itemId}/`, {
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
      const response = await fetch(`${this.apiUrl}${userId}/${itemId}/`, {
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
