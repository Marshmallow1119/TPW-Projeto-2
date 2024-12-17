import { Component, OnInit } from '@angular/core';
import { ProdutosCompanhiaService } from '../produtos-companhia.service';
import { CommonModule } from '@angular/common';
import { FiltroComponent } from '../filtro/filtro.component';
import { ArtistsCardProductsComponent } from '../artists-card-products/artists-card-products.component';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../models/produto';
import { filter } from 'rxjs';
import { Company } from '../models/company';
import { User } from '../models/user';
import { AuthService } from '../auth.service';
import { FavoritesService } from '../favorites.service';

interface favoriteProducts {
  product_id: number;
  user_id: number;
  product: Product;
}

@Component({
  standalone: true,
  imports: [CommonModule, FiltroComponent, ArtistsCardProductsComponent],
  selector: 'app-company-products',
  templateUrl: './company-products.component.html',
  styleUrls: ['./company-products.component.css'],
})

export class CompanyProductsComponent implements OnInit {
  company: any;
  products: Product[] = [];
  filteredProducts: Product[] = []; 
  isAuthenticated: boolean = false; 
  user: User | null = null; 
  userType: string = '';

  constructor(
    private route: ActivatedRoute,
    private produtosCompanhiaService: ProdutosCompanhiaService,
    private authService: AuthService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.loadCompaniesAndProducts();
    this.authService.user$.subscribe((user) => {
      this.user = user;
      this.isAuthenticated = this.authService.isAuthenticated();
      this.userType = user?.user_type || '';
    });
  }

  async loadCompaniesAndProducts(): Promise<void> {
    const company_id = Number(this.route.snapshot.paramMap.get('company_id')) || 0;
    try {
      const data = await this.produtosCompanhiaService.getCompanhiaProdutos(Number(company_id));

      if (data) {
        this.company = data.company;
        console.log('Companhia:', this.company);
        this.products = data.products;
        this.filteredProducts = [...this.products]; 
      } else {
        console.error('Nenhum dado retornado da API.');
      }
    } catch (error) {
      console.error('Erro ao carregar companhia e produtos:', error);
    }

    const favoritesResponse = await this.favoritesService.getFavorites('products');
    const favoriteProducts = Array.isArray(favoritesResponse) ? favoritesResponse : favoritesResponse.results || [];

    for (let product of this.products) {
      product.is_favorited = favoriteProducts.some(
        (favoriteProduct: favoriteProducts) => favoriteProduct.product.id === product.id
      );
    }
  }
  applyFilters(filters: any): void {
    console.log('Applying filters:', filters);
  
    this.filteredProducts = this.products.filter((product) => {
      console.log('Checking product:', product);
  
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
        (product.product_type === 'Accessory' && product.specific_details?.size === filters.size) ||
        (product.product_type === 'Clothing' &&
          product.specific_details?.sizes?.some((size: any) => size === filters.size));

        console.log(product.artist.id);
        console.log(filters.artist);
      const matchesArtist =
        !filters.artist || product.artist.id.toString() === filters.artist; 
  
      console.log(`Product: ${product.name}`, {
        matchesType,
        matchesPrice,
        matchesGenre,
        matchesColor,
        matchesSize,
        matchesArtist,
        matchesSale,
      });
  
      return matchesType && matchesPrice && matchesGenre && matchesColor && matchesSize && matchesArtist && matchesSale;
    });
  
    console.log('Filtered products:', this.filteredProducts);
  }
  
  
  sortProducts(order: string): void {
    console.log('Sorting products by:', order);
    if (order === 'priceAsc') {
      this.filteredProducts.sort((a, b) => a.price - b.price);
    } else if (order === 'priceDesc') {
      this.filteredProducts.sort((a, b) => b.price - a.price);
    } else {
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
}
