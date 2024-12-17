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
  showArtistFilter: boolean = false;
  genres: string[] = [];
  colors: string[] = []; 

  constructor(
    private route: ActivatedRoute,
    private produtosArtistaService: ProdutosArtistaService
  ) {}

  ngOnInit(): void {
    this.loadArtistAndProducts();
  }


  dropdownOpen: boolean = false;

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
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
      this.filteredProducts = [...this.filteredProducts].sort((a, b) => a.price - b.price);
    } else if (order === 'priceDesc') {
      this.filteredProducts = [...this.filteredProducts].sort((a, b) => b.price - a.price);
    } else if (order === 'featured') {
      this.filteredProducts = this.filteredProducts.sort((a, b) => {
        return (b.is_on_promotion ? 1 : 0) - (a.is_on_promotion ? 1 : 0);
      });
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
  
    this.filteredProducts = this.products.filter((product) => {
  
      const matchesType = !filters.type || product.product_type === filters.type;

      let matchesSale = true;
      if (filters.onSale && product.is_on_promotion) {
        matchesSale =  true;
      }
      else if (!filters.onSale && !product.is_on_promotion) {
        matchesSale =  true;
      }
      else {
        matchesSale =  false;
      }
        
  
      const matchesPrice =
        (!filters.min_price || product.price >= filters.min_price) &&
        (!filters.max_price || product.price <= filters.max_price);
  
      const matchesGenre =
        (!filters.genreVinyl ||
          (product.product_type === 'Vinil' && product.specific_details?.genre === filters.genreVinyl)) &&
        (!filters.genreCD ||
          (product.product_type === 'CD' && product.specific_details?.genre === filters.genreCD));
  
      const matchesColor =
        (!filters.colorClothing ||
          (product.product_type === 'Clothing' && product.specific_details?.color === filters.colorClothing)) &&
        (!filters.colorAccessory ||
          (product.product_type === 'Accessory' && product.specific_details?.color === filters.colorAccessory));
  
      const matchesSize =
        !filters.size ||
        (product.product_type === 'Accessory' && product.specific_details?.size === filters.size) ||
        (product.product_type === 'Clothing' &&
          product.specific_details?.sizes?.some((size: any) => size === filters.size));

        console.log(product.artist.id);
        console.log(filters.artist);
      const matchesArtist =
        !filters.artist || product.artist.id.toString() === filters.artist; 

  
      return matchesType && matchesPrice && matchesGenre && matchesColor && matchesSize && matchesArtist && matchesSale;
    });
  
    console.log('Filtered products:', this.filteredProducts);
  }

}
