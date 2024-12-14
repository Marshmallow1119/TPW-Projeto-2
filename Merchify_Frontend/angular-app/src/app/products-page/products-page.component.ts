import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';
import { Accessory, CD, Clothing, Product, Vinil } from '../models/produto';
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
  
    console.log('Applying filters:', filters);
  
    this.filteredProducts = this.products.filter((product) => {
      console.log('Checking product:', product);
      const matchesType = !filters.type || product.product_type === filters.type;
  
      const matchesPrice =
        (!filters.min_price || product.price >= filters.min_price) &&
        (!filters.max_price || product.price <= filters.max_price);
  
      // Check genre, color, and size in specific_details
      const matchesGenre =
        (!filters.genreVinyl || (this.isVinil(product) && product.specific_details?.genre === filters.genreVinyl)) &&
        (!filters.genreCD || (this.isCD(product) && product.specific_details?.genre === filters.genreCD));
  
      const matchesColor =
        (!filters.colorClothing || (this.isClothing(product) && product.specific_details?.color === filters.colorClothing)) &&
        (!filters.colorAccessory || (this.isAccessory(product) && product.specific_details?.color === filters.colorAccessory));
  
      const matchesSize =
        !filters.size ||
        (this.isAccessory(product) && product.specific_details?.size === filters.size) ||
        (this.isClothing(product) && product.specific_details?.sizes?.some((size: any) => size === filters.size));
  
      // Log matching criteria for debugging
      console.log(`Product: ${product.name}`, {
        matchesType,
        matchesPrice,
        matchesGenre,
        matchesColor,
        matchesSize,
      });
  
      return matchesType && matchesPrice && matchesGenre && matchesColor && matchesSize;
    });
  
    console.log('Filtered products:', this.filteredProducts);
  }
  
  

  private isVinil(product: Product): product is Vinil {
    return product.product_type === 'Vinil';
  }

  private isCD(product: Product): product is CD {
    return product.product_type === 'CD';
  }

  private isClothing(product: Product): product is Clothing {
    return product.product_type === 'Clothing';
  }

  private isAccessory(product: Product): product is Accessory {
    return product.product_type === 'Accessory';
  }
}
