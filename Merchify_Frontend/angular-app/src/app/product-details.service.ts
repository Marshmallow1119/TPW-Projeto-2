import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { base64toBlob } from './utils';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailsService {
  private baseUrl: string = 'http://localhost:8000/ws/';  

   constructor(private router:Router) { }

  //path('ws/product/<int:identifier>/',  views.productDetails, name='productDetails'),
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
