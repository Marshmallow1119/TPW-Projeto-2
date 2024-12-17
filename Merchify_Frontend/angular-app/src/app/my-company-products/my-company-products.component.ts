import { Component } from '@angular/core';
import { Product } from '../models/produto';
import { ActivatedRoute, Router  } from '@angular/router';
import { ProdutosCompanhiaService } from '../produtos-companhia.service';
import { CommonModule } from '@angular/common';
import { CONFIG } from '../config';
import { RouterModule } from '@angular/router';
import { ProductsService } from '../products.service';
import { SizeStockModalComponent } from '../size-stock-modal/size-stock-modal.component';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-my-company-products',
  standalone: true,
  imports: [CommonModule, RouterModule, SizeStockModalComponent, FormsModule],
  templateUrl: './my-company-products.component.html',
  styleUrl: './my-company-products.component.css'
})
export class MyCompanyProductsComponent {
  company: any;
  products: Product[] = [];
  isAuthenticated: boolean = false; 
  user: any = null; 
  selectedProduct: Product | null = null;
  baseUrl: string = CONFIG.baseUrl;
  isStockModalOpen: boolean = false;
  newPromotionPrice: number | null = null; 
  selectedProductForPromotion: any = null; 



  constructor(
    private route: ActivatedRoute,
    private produtosCompanhiaService: ProdutosCompanhiaService,
    private productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompanyProducts();
  }

  async loadCompanyProducts(): Promise<void> {
    const companyId = Number(this.route.snapshot.paramMap.get('company_id')) || 0;
    if (!companyId) {
      console.error('Nenhum ID de empresa fornecido.');
      return;
    }

    try {
      const data = await this.produtosCompanhiaService.getCompanhiaProdutos(companyId);
      if (data) {
        this.company = data.company;
        this.products = data.products;
      } else {
        console.error('Nenhum dado retornado da API.');
      }
    } catch (error) {
      console.error('Erro ao carregar produtos da empresa:', error)
      console.error(error);
    } finally {
    }
  }

  onAddProduct(): void {
    this.router.navigate(['/companies', this.company.id, 'products', 'add']);
  }

  openStockModal(product: Product): void {
    this.selectedProduct = product;
    this.isStockModalOpen = true;
  }

  closeStockModal(): void {
    this.selectedProduct = null;
    this.isStockModalOpen = false;
  }

  async onSaveStockChanges(updatedStockSize: { size: string; stock: number }[]): Promise<void> {
    if (!this.selectedProduct) {
      console.error('No product selected');
      return;
    }

    try {
      await this.productsService.updateProductStock(this.selectedProduct.id, updatedStockSize);
      await this.loadCompanyProducts();
      alert('Stock atualizado com sucesso!');
      this.closeStockModal();
    } catch (error) {
    }
  }

  async onDeleteProduct(productId: number): Promise<void> {
    if (confirm('Tem certeza que deseja eliminar este produto?')) {
      try {
        await this.produtosCompanhiaService.deleteProduct(productId);
        this.products = this.products.filter((product) => product.id !== productId);
      } catch (error) {
        console.error('Erro ao excluir o produto:', error);
      }
    }
  }

  async editProduct(product: Product): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', String(product.description));
      formData.append('price', String(product.price));
      formData.append('product_type', String(product.product_type));
      if (product.image_url) {
        formData.append('image', product.image_url);
      }
  
      const response = await fetch(`${this.baseUrl}/products/${product.id}/`, {
        method: 'PUT',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Erro ao atualizar produto: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao editar produto:', error);
      throw error;
    }
  }
  
  openPromotionModal(product: any): void {
    this.selectedProductForPromotion = product;
    this.newPromotionPrice = null;
  }
  
  closePromotionModal(): void {
    this.selectedProductForPromotion = null;
    this.newPromotionPrice = null;
  }

  confirmCancelPromotion(product: Product): void {
    this.cancelPromotion(product);
  }

  async applyPromotion(): Promise<void> {
    if (this.newPromotionPrice === null || this.newPromotionPrice <= 0) {
      alert('Por favor, insira um novo preço válido.');
      return;
    }
  
    if (this.selectedProductForPromotion) {
      try {
        const product = this.selectedProductForPromotion;
  
        await this.productsService.addPromotion(product, this.newPromotionPrice);
  
        alert('Promoção aplicada com sucesso!');
        this.closePromotionModal();
        this.loadCompanyProducts(); 
      } catch (error) {
        console.error('Erro ao aplicar promoção:', error);
        alert('Erro ao aplicar promoção.');
      }
    }
  }
  
  
  async cancelPromotion(product: Product): Promise<void> {
    const confirmation = confirm('Tem a certeza que deseja retirar a promoção?');
    if (!confirmation) return;
  
    try {
      await this.productsService.cancelPromotion(product);
  
      alert('Promoção cancelada com sucesso!');
      this.loadCompanyProducts(); 
    } catch (error) {
      console.error('Erro ao cancelar promoção:', error);
      alert('Erro ao cancelar promoção.');
    }
  }
  
}
