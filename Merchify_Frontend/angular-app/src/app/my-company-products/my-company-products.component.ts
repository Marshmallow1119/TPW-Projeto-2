import { Component } from '@angular/core';
import { Product } from '../models/produto';
import { ActivatedRoute, Router  } from '@angular/router';
import { ProdutosCompanhiaService } from '../produtos-companhia.service';
import { CommonModule } from '@angular/common';
import { CONFIG } from '../config';
import { RouterModule } from '@angular/router'; // Importação necessária



@Component({
  selector: 'app-my-company-products',
  imports: [CommonModule, RouterModule],
  templateUrl: './my-company-products.component.html',
  styleUrl: './my-company-products.component.css'
})
export class MyCompanyProductsComponent {
  company: any;
  products: Product[] = [];
  isAuthenticated: boolean = false; // Placeholder, set based on actual authentication logic
  user: any = null; // Placeholder for user object
  selectedProduct: Product | null = null;
  baseUrl: string = CONFIG.baseUrl;

  constructor(
    private route: ActivatedRoute,
    private produtosCompanhiaService: ProdutosCompanhiaService,
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
    // Redireciona para a página de adicionar produto
    this.router.navigate(['/companies', this.company.id, 'products', 'add']);
  }

  openClothingStockModal(product: Product): void {
    console.log('Abrindo modal de estoque para roupas:', product);
    this.selectedProduct = product;
    // Lógica para abrir o modal pode ser adicionada aqui se usar uma biblioteca específica
  }

  openStockModal(product: Product): void {
    console.log('Abrindo modal de estoque geral:', product);
    this.selectedProduct = product;
    // Lógica para abrir o modal pode ser adicionada aqui se usar uma biblioteca específica
  }

  async onDeleteProduct(productId: number): Promise<void> {
    if (confirm('Tem certeza que deseja eliminar este produto?')) {
      try {
        await this.produtosCompanhiaService.deleteProduct(productId);
        console.log(`Produto ${productId} eliminado com sucesso.`);
        // Remover o produto da lista localmente para evitar uma nova chamada à API
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
