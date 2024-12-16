import { Component } from '@angular/core';
import { Product } from '../models/produto';
import { ActivatedRoute, Router  } from '@angular/router';
import { ProdutosCompanhiaService } from '../produtos-companhia.service';
import { CommonModule } from '@angular/common';
import { CONFIG } from '../config';
import { RouterModule } from '@angular/router'; // Importação necessária
import { ProductsService } from '../products.service';
import { SizeStockModalComponent } from '../size-stock-modal/size-stock-modal.component';



@Component({
  selector: 'app-my-company-products',
  imports: [CommonModule, RouterModule, SizeStockModalComponent],
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
      console.log('Company and products loaded:', this.company, this.products);
    }
  }

  onAddProduct(): void {
    this.router.navigate(['/companies', this.company.id, 'products', 'add']);
  }

  openStockModal(product: Product): void {
    console.log('Opening stock modal for product:', product);
    this.selectedProduct = product;
    this.isStockModalOpen = true;
    console.log('Selected product:', this.selectedProduct);
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
      await this.productsService.updateProductStock(this.selectedProduct.id, updatedStockSize);
      await this.loadCompanyProducts();
      this.closeStockModal();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  }

  async onDeleteProduct(productId: number): Promise<void> {
    if (confirm('Tem certeza que deseja eliminar este produto?')) {
      try {
        await this.produtosCompanhiaService.deleteProduct(productId);
        console.log(`Produto ${productId} eliminado com sucesso.`);
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
  

}
