import { Injectable } from '@angular/core';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private baseUrl: string = CONFIG.baseUrl; // Configuração da URL base

  constructor() {}

  /**
   * Obtém os dados do perfil do usuário logado.
   */
  async getProfile(): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }
      console.log("entrou no serviço")
      const response = await fetch(`${this.baseUrl}/account/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar o perfil.');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro em getProfile:', error);
      throw error;
    }
  }

  async updateProfile(data: any): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const response = await fetch(`${this.baseUrl}/account/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar o perfil.');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro em updateProfile:', error);
      throw error;
    }
  }


  async deleteAccount(): Promise<void> {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Token de autenticação não encontrado.');
  
    const response = await fetch(`${this.baseUrl}/account/profile`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async changePassword(data: any, new_password: string): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const response = await fetch(`${this.baseUrl}/account/change-password`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar a senha.');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro em changePassword:', error);
      throw error;
    }
  }


}
