
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { base64toBlob } from './utils';
import { Artist } from './models/artista';

@Injectable({
  providedIn: 'root'
})
export class ArtistsService {
  private baseUrl: string = 'http://localhost:8000/ws/';  
  
  constructor(private router:Router) { }
  //    path('ws/artists/', views.artistas, name='artistas'),
  async getArtistas(): Promise<Artist[]> {
    try {
      const response = await fetch(`${this.baseUrl}artists/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const artists: Artist[] = await response.json();
      console.log('Fetched Artists:', artists); // Debug log
      return artists.map((artist) => ({
        ...artist,
        image: `http://localhost:8000${artist.image}`, // Adjust image URL if needed
      }));
    } catch (error) {
      console.error('Error fetching artists:', error);
      return [];
    }
  }


}
