import { Injectable } from '@angular/core';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private baseUrl: string = CONFIG.baseUrl;


  constructor() { }

  async getFavorites(category: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/favorites/${category}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
    });
    return response.json();
  }

  async addFavorite(productId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/favorites/${productId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({})
    });
    return response.json();
  }

  async addFavoriteArtist(artistId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/artist/${artistId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({})
    });
    return response.json();
  }

  async addFavoriteCompany(companyId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/company/${companyId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({})
    });
    return response.json();
  }

  async removeFavorite(productId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${productId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }});
    return response.json();
  }

  async removeFavoriteArtist(artistId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/artist/${artistId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }});
    return response.json();
  }

  async removeFavoriteCompany(companyId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/company/${companyId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }});
    return response.json();
  }
}
