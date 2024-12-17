import { Injectable } from '@angular/core';
import { CONFIG } from './config';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private baseUrl: string = CONFIG.baseUrl;

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

  async getUserImage(id : number): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }
      const response = await fetch(`${this.baseUrl}/user/${id}/image/`, {
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


  async updateProfile(data: FormData): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Token de autenticação não encontrado.');
  
      const response = await fetch(`${this.baseUrl}/account/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`, 
        },
        body: data,
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

  async changePassword(passwords: { old_password: string; new_password: string; confirm_new_password: string }): Promise<void> {
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
      body: JSON.stringify({
        submit_password: true,
        old_password: passwords.old_password,
        new_password: passwords.new_password,
        confirm_new_password: passwords.confirm_new_password,
      }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao alterar senha.');
    }
  }

}
