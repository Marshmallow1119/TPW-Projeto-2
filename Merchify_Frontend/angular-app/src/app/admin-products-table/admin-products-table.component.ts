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
  imports: [CommonModule, RouterModule, DeleteProductModalComponent, FormsModule],
})
export class AdminProductsTableComponent implements OnInit {
  products: Product[] = [];
  errorMessage: string | null = null;
  selectedProduct: Product | null = null;
  selectedProductForPromotion: any = null; // Produto selecionado para promoção
  newPromotionPrice: number | null = null; // Novo preço inserido no modal

  
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
  // Abre o modal de promoção
openPromotionModal(product: any): void {
  this.selectedProductForPromotion = { ...product }; // Clona o produto para preservar o estado original
  this.newPromotionPrice = product.price; // Preenche o preço atual
}

// Fecha o modal de promoção
closePromotionModal(): void {
  this.selectedProductForPromotion = null;
  this.newPromotionPrice = null;
}

async applyPromotion(): Promise<void> {
  if (this.newPromotionPrice === null || this.newPromotionPrice <= 0) {
    alert('Por favor, insira um novo preço válido.');
    return;
  }

  if (this.selectedProductForPromotion) {
    try {
      const product = this.selectedProductForPromotion;

      // Chama o serviço para aplicar a promoção
      await this.productService.addPromotion(product, this.newPromotionPrice);

      alert('Promoção aplicada com sucesso!');
      this.closePromotionModal();
      this.fetchProducts(); 
    } catch (error) {
      console.error('Erro ao aplicar promoção:', error);
      alert('Erro ao aplicar promoção.');
    }
  }
}


}
