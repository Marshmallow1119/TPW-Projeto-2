
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root'
})
export class ProdutosCompanhiaService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor(private router:Router) {}

  async getCompanhiaProdutos(company_id: number): Promise<any> {
    if (!company_id) {
      console.error('ID da companhia está vazio ou inválido');
      return null;
    }
    const url = `${this.baseUrl}/company/${company_id}/products/`;

    try {
      const data = await fetch(url); 
      if (!data.ok) {
        console.error(`Erro HTTP! status: ${data.status}`);
        throw new Error(`Erro HTTP! status: ${data.status}`);
      }
      const response = await data.json(); 
      if (response.company) {
        response.company.image = response.company.logo
          ? `http://localhost:8000${response.company.logo}` 
          : '/assets/logo.png'; 
      }
      return response; 
    } catch (error) {
      console.error('Erro ao buscar produtos:', error); 
      return null;
    }
  }

  async deleteProduct(productId: number): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/product/${productId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });      
    }
    catch (error) {
      console.error('Error deleting product:', error);
    }
  }


}