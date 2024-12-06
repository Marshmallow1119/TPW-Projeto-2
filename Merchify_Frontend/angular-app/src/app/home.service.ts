import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from './models/produto';
import { base64toBlob } from './utils';

@Injectable({
  providedIn: 'root' 
})
export class HomeService {
  private baseUrl: string = 'http://localhost:8000/ws/';

  constructor() {}

  async getHomeData(): Promise<{ artists: any[], recent_products: any[] }> {
    const url = this.baseUrl + 'home/';
    try {
      const response: Response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }

      const data = await response.json();

      const baseUrl = 'http://localhost:8000';
      data.artists.forEach((artist: any) => {
        if (artist.image) {
          artist.image = baseUrl + artist.image;
        }
      });

      data.recent_products.forEach((product: any) => {
        if (product.image) {
          product.image = baseUrl + product.image;
        }
      });

      return data;

    } catch (error) {
      console.error('Erro ao buscar dados da home:', error);
      throw error;
    }
  }
}
