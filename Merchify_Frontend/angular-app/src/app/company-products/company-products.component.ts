import { Component, OnInit } from '@angular/core';
import { ProdutosCompanhiaService } from '../produtos-companhia.service';
import { CommonModule } from '@angular/common';
import { FiltroComponent } from '../filtro/filtro.component';
import { ArtistsCardProductsComponent } from '../artists-card-products/artists-card-products.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FiltroComponent, ArtistsCardProductsComponent],
  selector: 'app-company-products',
  templateUrl: './company-products.component.html',
  styleUrls: ['./company-products.component.css'],
})
export class CompanyProductsComponent implements OnInit {
  company: any;
  products: any[] = [];
  genres: string[] = []; // Placeholder for genres, update based on API data
  colors: string[] = []; // Placeholder for colors, update based on API data
  filteredProducts: any[] = []; // For filtered product list
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
        this.filteredProducts = [...this.products]; // Initialize filtered products
        // Placeholder genres/colors. Replace with data from API if available.
        this.genres = ['Pop', 'Rock', 'Jazz', 'Hip-Hop'];
        this.colors = ['Red', 'Blue', 'Green', 'Black'];
      } else {
        console.error('Nenhum dado retornado da API.');
      }
    } catch (error) {
      console.error('Erro ao carregar companhia e produtos:', error);
    }
  }

  // Placeholder for applying filters
  onFiltersApplied(filters: any): void {
    console.log('Filters applied:', filters);
    // Update `filteredProducts` based on filters
    this.filteredProducts = this.products.filter((product) => {
      // Example filter logic, customize as needed
      if (filters.genre && product.genre !== filters.genre) return false;
      if (filters.color && product.color !== filters.color) return false;
      return true;
    });
  }

  // Placeholder for sorting products
  sortProducts(order: string): void {
    console.log('Sorting products by:', order);
    if (order === 'priceAsc') {
      this.filteredProducts.sort((a, b) => a.price - b.price);
    } else if (order === 'priceDesc') {
      this.filteredProducts.sort((a, b) => b.price - a.price);
    } else {
      this.filteredProducts = [...this.products]; // Reset to original order
    }
  }

  // Placeholder for toggling favorite
  onFavoriteToggled(product: any): void {
    console.log('Favorite toggled for product:', product);
    // Implement favorite toggle logic
    product.isFavorite = !product.isFavorite;
  }
}
