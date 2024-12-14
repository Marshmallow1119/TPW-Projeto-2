import { Component, OnInit } from '@angular/core';
import { ProdutosCompanhiaService } from '../produtos-companhia.service';
import { CommonModule } from '@angular/common';
import { FiltroComponent } from '../filtro/filtro.component';
import { ArtistsCardProductsComponent } from '../artists-card-products/artists-card-products.component';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../models/produto';
import { filter } from 'rxjs';

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
  filteredProducts: Product[] = []; // For filtered product list
  isAuthenticated: boolean = false; // Placeholder, set based on actual authentication logic
  user: any = null; // Placeholder for user object

  constructor(
    private route: ActivatedRoute,
    private produtosCompanhiaService: ProdutosCompanhiaService
  ) {}

  ngOnInit(): void {
    this.loadCompaniesAndProducts();
  }

  async loadCompaniesAndProducts(): Promise<void> {
    const company_id = Number(this.route.snapshot.paramMap.get('company_id')) || 0;
    try {
      const data = await this.produtosCompanhiaService.getCompanhiaProdutos(Number(company_id));

      if (data) {
        this.company = data.company;
        this.products = data.products;
        this.filteredProducts = [...this.products]; 
      } else {
        console.error('Nenhum dado retornado da API.');
      }
    } catch (error) {
      console.error('Erro ao carregar companhia e produtos:', error);
    }
  }

  applyFilters(filters: any): void {
  
    console.log('Applying filters:', filters);
  
    this.filteredProducts = this.products.filter((product) => {
      console.log('Checking product:', product);

      console.log(filters.type);
      console.log(product.product_type);
  
      const matchesType = !filters.type || product.product_type === filters.type;
  
      const matchesPrice =
        (!filters.min_price || product.price >= filters.min_price) &&
        (!filters.max_price || product.price <= filters.max_price);
  
      const matchesGenre =
        (!filters.genreVinyl || (product.product_type === 'Vinil' && product.specific_details?.genre === filters.genreVinyl)) &&
        (!filters.genreCD || (product.product_type === 'CD' && product.specific_details?.genre === filters.genreCD));
  
      const matchesColor =
        (!filters.colorClothing || (product.product_type === 'Clothing' && product.specific_details?.color === filters.colorClothing)) &&
        (!filters.colorAccessory || (product.product_type === 'Accessory' && product.specific_details?.color === filters.colorAccessory));
  
      const matchesSize =
        !filters.size ||
        (product.product_type === 'Accessory' && product.specific_details?.size === filters.size) ||
        (product.product_type === 'Clothing' && product.specific_details?.sizes?.some((size: any) => size === filters.size));
  
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

  onFavoriteToggled(product: any): void {
    console.log('Favorite toggled for product:', product);
    product.isFavorite = !product.isFavorite;
  }
}
