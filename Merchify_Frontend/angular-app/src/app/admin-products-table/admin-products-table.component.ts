import { Component, Input, OnInit } from '@angular/core';
import { Product, Vinil, CD, Clothing, Accessory } from '../models/produto';
import { ProductsService } from '../products.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeleteProductModalComponent } from '../delete-product-modal/delete-product-modal.component';

@Component({
  selector: 'app-admin-products-table',
  standalone: true,
  templateUrl: './admin-products-table.component.html',
  styleUrl: './admin-products-table.component.css',
  imports: [CommonModule, RouterModule, DeleteProductModalComponent]
})
export class AdminProductsTableComponent implements OnInit {
  products: Product[] = [];
  errorMessage: string | null = null;
  selectedProduct: Product | null = null;
  
  constructor(private productService: ProductsService) {}

  async ngOnInit(): Promise<void> {
    await this.fetchProducts();
    console.log('Products:', this.products);
  }

  async fetchProducts(): Promise<void> {
    try {
      this.products = await this.productService.getProducts();
      console.log('Fetched products:', this.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      this.errorMessage = 'Error fetching products';
    }
  }

  isVinil(product: Product): product is Vinil {
    return product.product_type === 'Vinil';
  }

  isCD(product: Product): product is CD {
    return product.product_type === 'CD';
  }

  isClothing(product: Product): product is Clothing {
    return product.product_type === 'Clothing';
  }

  isAccessory(product: Product): product is Accessory {
    return product.product_type === 'Accessory';
  }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id);
    this.products = this.products.filter((product) => product.id !== id);
  }


  openDeleteModal(product: Product): void {
    this.selectedProduct = product;
    const modal = document.getElementById('deleteProductModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteProductModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

  onConfirmDelete(productId: number): void {
    console.log('Deleting product with ID:', productId);
    this.closeDeleteModal();
  }
  

}
