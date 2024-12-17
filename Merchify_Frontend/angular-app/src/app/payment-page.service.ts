import { Injectable } from '@angular/core';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root',
})
export class PaymentPageService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor() {}

  private async getToken(): Promise<string> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Token de autenticação ausente. Faça login novamente.');
    }
    return token;
  }

  async applyDiscount(discountCode: string): Promise<{ success: boolean; message?: string; discountValue?: number }> {
    const token = await this.getToken();

    if (!discountCode) {
      return { success: false, message: 'Por favor, insira um código de desconto.' };
    }
    try {
      const response = await fetch(`${this.baseUrl}/apply_discount/?discount_code=${discountCode}`, { 
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, discountValue: data.discount_value };
      } else {
        return { success: false, message: data.message || 'Falha ao aplicar o desconto.' };
      }
    } catch (error) {
      console.error('Erro ao aplicar o desconto:', error);
      return { success: false, message: 'Erro no servidor ao aplicar o desconto.' };
    }
}

  
async submitPayment(paymentData: { payment_method: string; shipping_address: string; discountApplied: boolean, discountValue: any}): Promise<any> {
  const token = await this.getToken();

  try {
    const response = await fetch(`${this.baseUrl}/process_payment/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    return await response.json();
  } catch (error: any) {
    console.error('Erro ao processar o pagamento:', error);
    throw new Error('Erro no servidor ao processar o pagamento.');
  }
}
}




