import { Component, OnInit } from '@angular/core';
import { Product, Vinil, CD, Clothing, Accessory } from '../models/produto';
import { ProductsService } from '../products.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeleteProductModalComponent } from '../delete-product-modal/delete-product-modal.component';
import { SizeStockModalComponent } from '../size-stock-modal/size-stock-modal.component';

@Component({
  selector: 'app-admin-products-table',
  standalone: true,
  templateUrl: './admin-products-table.component.html',
  styleUrls: ['./admin-products-table.component.css'],
  imports: [CommonModule, RouterModule, DeleteProductModalComponent, SizeStockModalComponent],
})
export class AdminProductsTableComponent implements OnInit {
  products: Product[] = [];
  errorMessage: string | null = null;
  selectedProduct: Product | null = null;
  isStockModalOpen: boolean = false; // Track modal state

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

  // Type guards for different product types
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

  // Handle delete logic
  deleteProduct(id: number): void {
    this.productService.deleteProduct(id);
    this.products = this.products.filter((product) => product.id !== id);
  }

  openDeleteModal(product: Product): void {
    console.log('Opening modal for product:', product);
    this.selectedProduct = product;
    console.log('Selected product:', this.selectedProduct);
  }

  closeDeleteModal(): void {
    console.log('Closing modal');
    this.selectedProduct = null;
  }

  onConfirmDelete(productId: number): void {
    console.log('Deleting product with ID:', productId);
    this.deleteProduct(productId);
    this.closeDeleteModal();
  }

  openStockModal(product: Product): void {
    console.log('Opening stock modal for product:', product);
    this.selectedProduct = product;
    this.isStockModalOpen = true;
  }

  closeStockModal(): void {
    console.log('Closing stock modal');
    this.selectedProduct = null;
    this.isStockModalOpen = false;
  }

  async onSaveStockChanges(updatedStockSize: { size: string; stock: number }[]): Promise<void> {
    if (!this.selectedProduct) {
      console.error('No product selected');
      return;
    }

    try {
      await this.productService.updateProductStock(this.selectedProduct.id, updatedStockSize);
      await this.fetchProducts();
      this.closeStockModal();
    } catch (error) {
      console.error('Error updating stock:', error);
      this.errorMessage = 'Error updating stock';
    }
  }
}
