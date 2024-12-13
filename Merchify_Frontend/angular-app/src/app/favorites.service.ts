import { Injectable, Inject } from '@angular/core';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor() { }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  async getFavorites(category: string): Promise<any> {
    const token = this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/favorites/get/${category}/`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
    });
    return response.json();
  }

  async addFavorite(productId: number): Promise<any> {
    const token = this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/favorites/products/${productId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({})
    });
    return response.json();
  }

  async addFavoriteArtist(artistId: number): Promise<any> {
    const token = this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/favorites/artists/${artistId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({})
    });
    return response.json();
  }

  async addFavoriteCompany(companyId: number): Promise<any> {
    const token = this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/favorites/company/${companyId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({})
    });
    return response.json();
  }

  async removeFavorite(productId: number): Promise<any> {
    const token = this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/favorites/products/${productId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }});
    return response.json();
  }

  async removeFavoriteArtist(artistId: number): Promise<any> {
    const token = this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/favorites/artists/${artistId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }});
    return response.json();
  }

  async removeFavoriteCompany(companyId: number): Promise<any> {
    const token = this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/favorites/company/${companyId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }});
    return response.json();
  }
}
