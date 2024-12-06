import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';
import { Product } from '../models/produto';
import { ProductCardComponent } from '../product-card/product-card.component';
import { FiltroComponent } from '../filtro/filtro.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, FiltroComponent],
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.css'],
})
export class ProductsPageComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  filters: any = {}; 
  private productService: ProductsService = inject(ProductsService);
  user: any = { is_authenticated: true, user_type: 'individual' }; 
  
  async ngOnInit(): Promise<void> {
    await this.loadProductsData();
  }

  private async loadProductsData(): Promise<void> {
    try {
      this.products = await this.productService.getProducts();
      this.filteredProducts = [...this.products];
      console.log('Produtos carregados:', this.products);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
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
