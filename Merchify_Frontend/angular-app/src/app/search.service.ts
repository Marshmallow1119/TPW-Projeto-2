import { Injectable } from '@angular/core';
import { Product } from './models/produto'; 
import { Artist } from './models/artista';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor() {}

  async search(query: string): Promise<{ artists: Artist[]; products: Product[] }> {
    if (!query.trim()) {
      return { artists: [], products: [] };
    }
  
    const url = `${this.baseUrl}/search/?search=${encodeURIComponent(query)}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Fetched Search Results:', data); // Debug log
        console.log('Fetched Search Results:', data); // Debug log
      const artists: Artist[] = (data.artists || [])
  
      const products: Product[] = (data.products || [])
      return { artists, products };
    } catch (error) {
      console.error('Error fetching search results:', error);
      return { artists: [], products: [] };
    }
  }
  
}
