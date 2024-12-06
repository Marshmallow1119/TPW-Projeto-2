
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ProdutosCompanhiaService {
  private baseUrl: string = 'http://localhost:8000/ws/';

  constructor(private router:Router) {}

  /**
   * Obtém os produtos de uma companhia específica.
   * @param name Nome da companhia.
   *     path('ws/company/<int:company_id>/products/', views.company_products, name='company_products'),
   */

  async getCompanhiaProdutos(company_id: number): Promise<any> {
    console.log(company_id); 
    if (!company_id) {
      console.error('ID da companhia está vazio ou inválido');
      return null;
    }
    const url = `${this.baseUrl}company/${company_id}/products/`;
    console.log(`Fetching products for company: ${company_id} from URL: ${url}`);

    try {
      const data = await fetch(url); 
      if (!data.ok) {
        console.error(`Erro HTTP! status: ${data.status}`);
        throw new Error(`Erro HTTP! status: ${data.status}`);
      }
      const response = await data.json(); 
      console.log('Fetched company products:', response); 
      if (response.products) {
        response.products.forEach((product: any) => {
          product.image = product.image
            ? `http://localhost:8000${product.image}` // Ensure full URL for images
            : null;
        });
      }
      if (response.company) {
        response.company.image = response.company.logo
          ? `http://localhost:8000${response.company.logo}` // Full URL for the logo
          : '/assets/logo.png'; // Fallback logo
      }
      return response; 
    } catch (error) {
      console.error('Erro ao buscar produtos:', error); 
      return null;
    }
  }


}