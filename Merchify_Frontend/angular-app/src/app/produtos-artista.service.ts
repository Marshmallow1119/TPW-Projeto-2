import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ProdutosArtistaService {
  private baseUrl: string = 'http://localhost:8000/ws/';

  constructor(private router:Router) {}

  /**
   * Obtém os produtos de um artista específico.
   * @param name Nome do artista.
   */
  async getArtistaProdutos(name: string): Promise<any> {
    console.log(name); 
    if (!name) {
      console.error('Nome do artista está vazio ou inválido');
      return null;
    }
    const url = `${this.baseUrl}products/${name}`;
    console.log(`Fetching products for artist: ${name} from URL: ${url}`);
  
    try {
      const data = await fetch(url); 
      if (!data.ok) {
        console.error(`Erro HTTP! status: ${data.status}`);
        throw new Error(`Erro HTTP! status: ${data.status}`);
      }
      const response = await data.json(); 
      console.log('Fetched artist products:', response); 
      if (response.products) {
        response.products.forEach((product: any) => {
          product.image = `http://localhost:8000${product.image_url}`;
        });
      }
      if (response.artist) {
        response.artist.image = `http://localhost:8000${response.artist.image_url}`;
        response.artist.backgroundUrl = `http://localhost:8000${response.artist.background_url}`;
      }
      return response; 
    } catch (error) {
      console.error('Erro ao buscar produtos:', error); 
      return null;
    }
  }
  
}