import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../products.service';
import { Product } from '../models/produto';
import { ProductCardComponent } from '../product-card/product-card.component';
import { RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FiltroComponent } from '../filtro/filtro.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule,ProductCardComponent,FiltroComponent],  
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.css'],
})
export class ProductsPageComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  filters: any = {}; // Captured from FilterComponent

  constructor(private productsService: ProductsService) {}

  async ngOnInit(): Promise<void> {
    this.products = await this.productsService.getProducts();
    this.filteredProducts = [...this.products];
  }

  // Update products based on filters
  applyFilters(filters: any): void {
  //  this.filters = filters;
  //  this.filteredProducts = this.products.filter((product) => {
  //    let matches = true;
  //    if (filters.type && product.type !== filters.type) matches = false;
  //    if (filters.genre && product.genre !== filters.genre) matches = false;
  //    if (filters.color && product.color !== filters.color) matches = false;
  //    if (filters.size && product.size !== filters.size) matches = false;
  //    if (filters.min_price && product.price < filters.min_price) matches = false;
  //    if (filters.max_price && product.price > filters.max_price) matches = false;
  //    return matches;
  //  });
  }
}
