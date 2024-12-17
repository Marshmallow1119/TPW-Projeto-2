import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';
import { Accessory, CD, Clothing, Product, Vinil } from '../models/produto';
import { ProductCardComponent } from '../product-card/product-card.component';
import { FiltroComponent } from '../filtro/filtro.component';
import { CommonModule } from '@angular/common';
import { ArtistsService } from '../artists.service';
import { Artist } from '../models/artista';
import { FavoritesService } from '../favorites.service';
import { AuthService } from '../auth.service';
import { User } from '../models/user';

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
  user: User | null = null;


  constructor(private favoritesService: FavoritesService) {}

  private productService: ProductsService = inject(ProductsService);
  private artistsService: ArtistsService = inject(ArtistsService);
  private authService: AuthService = inject(AuthService);
  
  async ngOnInit(): Promise<void> {
    await this.loadProductsAndArtistsData();
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
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
  
      const favoritesResponse = await this.favoritesService.getFavorites('products');
      const favoriteProducts = Array.isArray(favoritesResponse) ? favoritesResponse : favoritesResponse.results || [];
  
      for (let product of this.products) {
        product.is_favorited = favoriteProducts.some(
          (favoriteProduct: favoriteProducts) => favoriteProduct.product.id === product.id
        );
      }
    } catch (error) {
      console.error('Erro ao carregar produtos e artistas:', error);
    }
  }
  

  applyFilters(filters: any): void {
  
    this.filteredProducts = this.products.filter((product) => {
  
      const matchesType = !filters.type || product.product_type === filters.type;

      let matchesSale = true;
      if (filters.onSale && product.is_on_promotion) {
        matchesSale =  true;
      }
      else if (!filters.onSale && !product.is_on_promotion) {
        matchesSale =  true;
      }
      else if (!filters.onSale && product.is_on_promotion) {
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
        (product.product_type === 'Clothing' &&
          product.stock_size?.some((sizeObj: any) => sizeObj.size === filters.size));
        console.log(product.stock_size);
        console.log(product.artist.id);
        console.log(filters.artist);
      const matchesArtist =
        !filters.artist || product.artist.id.toString() === filters.artist; 

  
      return matchesType && matchesPrice && matchesGenre && matchesColor && matchesSize && matchesArtist && matchesSale;
    });
  
    console.log('Filtered products:', this.filteredProducts);
  }

}
