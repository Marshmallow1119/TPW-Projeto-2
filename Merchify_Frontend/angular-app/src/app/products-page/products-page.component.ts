import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';
import { Product } from '../models/produto';
import { ProductCardComponent } from '../product-card/product-card.component';
import { FiltroComponent } from '../filtro/filtro.component';
import { CommonModule } from '@angular/common';
import { ArtistsService } from '../artists.service';
import { Artist } from '../models/artista';
import { FavoritesService } from '../favorites.service';

interface favoriteProducts {
  product_id: number;
  user_id: number;
  product: Product;
}


@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, FiltroComponent],
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.css'],
})
export class ProductsPageComponent implements OnInit {
  products: Product[] = [];
  artists: Artist[] = [];
  filteredProducts: Product[] = [];
  filters: any = {}; 

  constructor(private favoritesService: FavoritesService) {}

  private productService: ProductsService = inject(ProductsService);
  private artistsService: ArtistsService = inject(ArtistsService);
  user: any = { is_authenticated: true, user_type: 'individual' }; 
  
  async ngOnInit(): Promise<void> {
    await this.loadProductsAndArtistsData();
  }

  private async loadProductsAndArtistsData(): Promise<void> {
    try {
      const [products, artists] = await Promise.all([
        this.productService.getProducts(),
        this.artistsService.getArtistas(),
      ]);
      const artistMap = artists.reduce((map, artist) => {
        map[artist.id] = artist;
        return map;
      }, {} as { [key: number]: Artist });
  
      this.products = products.map(product => {
        const productArtist = product.artist; 
        const associatedArtist = typeof productArtist === 'number' 
          ? artistMap[productArtist] 
          : productArtist; 
  
  
        return {
          ...product,
          artist: associatedArtist, 
        };
      });
      this.artists = artists;
      this.filteredProducts = [...this.products];
    
      let favoriteProducts: favoriteProducts[] = await this.favoritesService.getFavorites('products');
      for (let product of this.products) {
        product.is_favorited = favoriteProducts.some(favoriteProduct => favoriteProduct.product.id === product.id);
      } 
    } catch (error) {
      console.error('Erro ao carregar produtos e artistas:', error);
    }
  }

  applyFilters(filters: any): void {
    this.filters = filters;

    this.filteredProducts = this.products.filter((product) => {
      const matchesType = !filters.type || product.category === filters.type;
      const matchesPrice =
        (!filters.min_price || product.price >= filters.min_price) &&
        (!filters.max_price || product.price <= filters.max_price);
      return matchesType && matchesPrice;
    });

    console.log('Filtros aplicados:', this.filters);
  }
}
