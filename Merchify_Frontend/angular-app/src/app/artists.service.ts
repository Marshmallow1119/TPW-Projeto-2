
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { base64toBlob } from './utils';
import { Artist } from './models/artista';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root'
})
export class ArtistsService {
  private baseUrl: string = CONFIG.baseUrl;
  constructor(private router:Router) { }

  //    path('ws/artists/', views.artistas, name='artistas'),
  async getArtistas(): Promise<Artist[]> {
    const url = `${this.baseUrl}artists/`;
    try {
      const response: Response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch Artists: ${response.statusText}`);
      }
      const artists: Artist[] = (await response.json()) ?? [];
      return artists;
    } catch (error) {
      console.error('Error fetching Artists:', error);
      throw error;
    }
  }


}
