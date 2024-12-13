import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { base64toBlob } from './utils';
import { CONFIG } from './config';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailsService {
  private baseUrl: string = CONFIG.baseUrl;

   constructor(private router:Router) { }

  async getProductDetails(productId: number): Promise<Observable<any>> {
    const url = `${this.baseUrl}product/${productId}/`;
    const data: Response = await fetch(url);
    const product: any = await data.json() ?? [];
    if (product.image) {
      product.image = `http://localhost:8000${product.image}`;
    }
    return product;
  }
  
}
