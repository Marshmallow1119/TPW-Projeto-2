import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FiltroComponent } from '../filtro/filtro.component';
import { ArtistsCardProductsComponent } from '../artists-card-products/artists-card-products.component';
import { ProdutosArtistaService } from '../produtos-artista.service';

@Component({
  standalone: true,
  imports: [CommonModule, FiltroComponent, ArtistsCardProductsComponent],
  selector: 'app-artists-products',
  templateUrl: './artists-products.component.html',
  styleUrls: ['./artists-products.component.css'],
})
export class ArtistsProductsComponent implements OnInit {
  artist: any = null; 
  products: any[] = []; 
  filteredProducts: any[] = []; 
  isAuthenticated: boolean = false; 
  user: any = { user_type: '' };

  genres: string[] = [];
  colors: string[] = []; 

  constructor(
    private route: ActivatedRoute,
    private produtosArtistaService: ProdutosArtistaService
  ) {}

  ngOnInit(): void {
    this.loadArtistAndProducts();
  }

  async loadArtistAndProducts(): Promise<void> {
    const artistName = this.route.snapshot.paramMap.get('artistName') || '';
    try {
      const data = await this.produtosArtistaService.getArtistaProdutos(artistName);

      if (data) {
        this.artist = data.artist;
        this.products = data.products;
        this.filteredProducts = [...this.products]; 
        this.genres = data.genres || [];
        this.colors = data.colors || [];
      } else {
        console.error('Nenhum dado retornado da API.');
      }
    } catch (error) {
      console.error('Erro ao carregar artista e produtos:', error);
    }
  }

  sortProducts(order: string): void {
    console.log('Sorting by:', order); // Debug log
    if (order === 'priceAsc') {
      this.filteredProducts.sort((a, b) => a.price - b.price);
    } else if (order === 'priceDesc') {
      this.filteredProducts.sort((a, b) => b.price - a.price);
    } else if (order === 'featured') {
      this.filteredProducts = [...this.products];
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
    console.log('Filtros aplicados:', filters); 
    this.filteredProducts = this.products.filter((product) => {
      if (filters.genreVinyl && product.genre !== filters.genreVinyl) return false;
      if (filters.colorClothing && product.color !== filters.colorClothing) return false;
      if (filters.min_price && product.price < filters.min_price) return false;
      if (filters.max_price && product.price > filters.max_price) return false;
      return true;
    });
  }
}
