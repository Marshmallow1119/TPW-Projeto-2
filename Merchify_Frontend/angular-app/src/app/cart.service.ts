import { Injectable } from '@angular/core';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor() {}

  private async getToken(): Promise<string> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Token de autenticação ausente. Faça login novamente.');
    }
    return token;
  }

  async getCart(userId: number): Promise<any> {
    const token = await this.getToken();
    try {
      const response = await fetch(`${this.baseUrl}/cart/${userId}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro HTTP ${response.status}: ${errorText}`);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter carrinho:', error);
      throw error;
    }
  }

  async addToCart(userId: number, productId: number, data: any): Promise<any> {
    const token = await this.getToken();
    try {
      const response = await fetch(`${this.baseUrl}/cart/${userId}/product/${productId}/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      throw error;
    }
  }

  async updateCartItem(userId: number, itemId: number, data: any): Promise<any> {
    const token = await this.getToken();
    try {
      const response = await fetch(`${this.baseUrl}/cart/${userId}/item/${itemId}/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar item do carrinho:', error);
      throw error;
    }
  }

  async removeCartItem(userId: number, itemId: number): Promise<any> {
    const token = await this.getToken();
    try {
      const response = await fetch(`${this.baseUrl}/cart/${userId}/item/${itemId}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      throw error;
    }
  }
}
