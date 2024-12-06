import { Injectable } from '@angular/core';
import { base64toBlob } from './utils'; // Adjust the path to your utility functions
import { Product } from './models/produto'; // Adjust the path to your models
import { Artist } from './models/artista'; // Adjust the path to your models

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private baseUrl: string = 'http://localhost:8000/ws/';

  constructor() {}

  async search(query: string): Promise<{ artists: Artist[]; products: Product[] }> {
    if (!query.trim()) {
      return { artists: [], products: [] };
    }
  
    const url = `${this.baseUrl}search/?search=${encodeURIComponent(query)}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Fetched Search Results:', data); // Debug log
  
      const artists: Artist[] = (data.artists || []).map((artist: any) => ({
        ...artist,
        image: `http://localhost:8000${artist.image}`, // Prepend base URL
      }));
  
      const products: Product[] = (data.products || []).map((product: any) => ({
        ...product,
        image: `http://localhost:8000${product.image}`, // Prepend base URL
      }));
  
      return { artists, products };
    } catch (error) {
      console.error('Error fetching search results:', error);
      return { artists: [], products: [] };
    }
  }
  
}
