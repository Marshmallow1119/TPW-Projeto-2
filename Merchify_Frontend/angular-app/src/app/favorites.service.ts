import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private baseUrl = 'http://localhost:8000/ws/';


  constructor() { }

  // Obtém favoritos por categoria
  async getFavorites(category: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${category}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    return response.json();
  }

  // Adiciona um produto aos favoritos
  async addFavorite(productId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}add/${productId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    return response.json();
  }

  // Adiciona um artista aos favoritos
  async addFavoriteArtist(artistId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}add/artist/${artistId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    return response.json();
  }

  // Adiciona uma companhia aos favoritos
  async addFavoriteCompany(companyId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}add/company/${companyId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    return response.json();
  }

  // Remove um produto dos favoritos
  async removeFavorite(productId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}remove/${productId}/`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Remove um artista dos favoritos
  async removeFavoriteArtist(artistId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}remove/artist/${artistId}/`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Remove uma companhia dos favoritos
  async removeFavoriteCompany(companyId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}remove/company/${companyId}/`, {
      method: 'DELETE'
    });
    return response.json();
  }
}
