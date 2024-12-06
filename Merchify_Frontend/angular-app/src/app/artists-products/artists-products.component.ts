
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ArtistsService } from '../artists.service';
import { CommonModule } from '@angular/common';
import { FiltroComponent } from '../filtro/filtro.component';
import { ArtistsCardProductsComponent } from '../artists-card-products/artists-card-products.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, FiltroComponent, ArtistsCardProductsComponent],
  selector: 'app-artists-products',
  templateUrl: './artists-products.component.html',
  styleUrls: ['./artists-products.component.css'],
})
export class ArtistsProductsComponent implements OnInit {
  artist: any = { name: '', image: '', backgroundUrl: '' }; // Informações do artista
  products: any[] = []; // Produtos do artista
  filteredProducts: any[] = []; // Produtos filtrados
  isAuthenticated: boolean = true; // Estado de autenticação
  user: any = { user_type: 'individual' }; // Dados do usuário

  genres: string[] = ['Rock', 'Pop', 'Jazz']; // Gêneros disponíveis
  colors: string[] = ['Red', 'Blue', 'Green']; // Cores disponíveis

  constructor(
    private route: ActivatedRoute,
    private artistsService: ArtistsService
  ) {}

  ngOnInit(): void {
    this.loadArtistAndProducts();
  }

  async loadArtistAndProducts(): Promise<void> {
    const artistName = this.route.snapshot.paramMap.get('artistName') || '';
    this.artist.name = artistName; // Definindo o nome do artista
    try {
      this.products = await this.artistsService.getArtistaProdutos(artistName);
      this.filteredProducts = [...this.products]; // Inicialmente, todos os produtos estão filtrados
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }

  sortProducts(order: string): void {
    if (order === 'priceAsc') {
      this.filteredProducts.sort((a, b) => a.price - b.price);
    } else if (order === 'priceDesc') {
      this.filteredProducts.sort((a, b) => b.price - a.price);
    } else if (order === 'featured') {
      this.filteredProducts.sort((a, b) => b.featured - a.featured); // Exemplo: destaque
    }
  }

  onFavoriteToggled(productId: number): void {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      product.is_favorited = !product.is_favorited;
      console.log(`Produto favorito alterado: ${productId}`);
    }
  }

  onFiltersApplied(filters: any): void {
    console.log('Filtros aplicados:', filters); // Log para depuração
    this.filteredProducts = this.products.filter((product) => {
      if (filters.genreVinyl && product.genre !== filters.genreVinyl) return false;
      if (filters.colorClothing && product.color !== filters.colorClothing) return false;
      if (filters.min_price && product.price < filters.min_price) return false;
      if (filters.max_price && product.price > filters.max_price) return false;
      return true;
    });
  }
}


