
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from './models/produto';
import { base64toBlob } from './utils';
import { Artist } from './models/artista';

@Injectable({
  providedIn: 'root'
})
export class ArtistsService {
  private baseUrl: string = 'http://localhost:8000/ws/';  
  
  constructor(private router:Router) { }

  //getProduct
  async getArtista(id:number):Promise<Artist>{
    //path('ws/products/<str:name>/', views.artistsProducts, name='artistsProducts'),
    const url = this.baseUrl + 'products/' + id;
    const data: Response =  await fetch(url);
    const artist: Artist = await data.json() ?? [];
    const blob = base64toBlob(artist.image, 'image/png');
    artist.image = URL.createObjectURL(blob);
    return artist;
  }

  //getProducts
  async getArtistas():Promise<Artist[]>{
    //
    const url = this.baseUrl + 'artists/';
    const data: Response =  await fetch(url);
    
    const artists: Artist[] = await data.json() ?? [];
    for (let artist of artists){
      const blob = base64toBlob(artist.image, 'image/png');
      artist.image = URL.createObjectURL(blob);
    }

    return artists;
  }


}
