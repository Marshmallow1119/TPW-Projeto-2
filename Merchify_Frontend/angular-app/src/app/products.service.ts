import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from './models/produto';
import { base64toBlob } from './utils';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private baseUrl: string = 'http://localhost:8000/ws/';  
  
  constructor(private router:Router) { }

  //getProduct
  async getProduct(id:number):Promise<Product>{
    //path('ws/product/<int:identifier>/',  views.productDetails, name='productDetails'),
    const url = this.baseUrl + 'produtos/' + id;
    const data: Response =  await fetch(url);
    const product: Product = await data.json() ?? [];
    const blob = base64toBlob(product.image, 'image/png');
    product.image = URL.createObjectURL(blob);
    return product;

  }

  //getProducts
  async getProducts():Promise<Product[]>{
    //
    const url = this.baseUrl + 'produtos/';
    const data: Response =  await fetch(url);
    
    const products: Product[] = await data.json() ?? [];
    for (let product of products){
      const blob = base64toBlob(product.image, 'image/png');
      product.image = URL.createObjectURL(blob);
    }
    return products;
  }


}
