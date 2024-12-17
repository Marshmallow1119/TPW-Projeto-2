import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../cart.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { User } from '../models/user';
import { Cart } from '../models/cart';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']  
  })
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  cartItems: any[] = [];
  cartTotal: number = 0;
  user: User | null = null;

  constructor(private cartService: CartService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (this.user?.id) {
        this.loadCart(this.user.id);
      }
    });
  }

  async loadCart(userId: number) {
    try {
      console.log('userId:', userId);
  
      const response = await this.cartService.getCart(userId);
  
      if (response && response.cart_items) {
        this.cartItems = response.cart_items.map((item: any) => ({
          id: item.id,
          cart: { 
            id: item.cart, 
            user: this.user as User, 
            date: new Date(), 
            items: [], 
            total: 0
          },
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            imageUrl: item.product.image_url,
            artist: item.product.artist,
            company: item.product.company,
            category: item.product.category,
            addedProduct: item.product.addedProduct,
            count: item.product.count,
            averageRating: item.product.average_rating,
            productType: item.product.product_type,
            stock: item.product.stock,
            specificDetails: {
              id: item.product.specific_details.id,
              name: item.product.specific_details.name,
              genre: item.product.specific_details.genre,
              lpSize: item.product.specific_details.lpSize,
              releaseDate: item.product.specific_details.releaseDate,
              stock: item.product.specific_details.stock,
              imageBase64: item.product.specific_details.image_base64,
            },
            is_on_promotion: item.product.is_on_promotion || false, 
            old_price: item.product.old_price || null,
          },
          quantity: item.quantity,
          size: item.size,
          total: item.total
        }));
  
        this.cart = {
          id: response.cart_id, 
          user: this.user as User,
          date: new Date(), 
          items: this.cartItems, 
          total: this.cartItems.reduce((sum, item) => sum + item.total, 0)
        };
  
        console.log('Cart:', this.cart);
        console.log('CartItems:', this.cartItems);
  
        this.calculateTotal();
      } else {
        console.error('Erro: Resposta do carrinho inválida.', response);
      }
    } catch (error) {
      console.error('Erro ao carregar o carrinho:', error);
    }
  }
  

  calculateTotal() {
    this.cartTotal = this.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  getImageSrc(imageBase64: string | null): string {
    if (!imageBase64) {
      return 'assets/images/default-product.png';
    }
    return `data:image/jpeg;base64,${imageBase64}`;
  }
  

  async updateCartItem(item: any) {
  try {
    const userId = this.user?.id || 0; 
    await this.cartService.updateCartItem(userId, item.id, { quantity: item.quantity });
    this.calculateTotal(); 
  } catch (error) {
    console.error('Erro ao atualizar o item do carrinho:', error);
  }
}

  async removeCartItem(itemId: number) {
    try {
      await this.cartService.removeCartItem(this.user?.id || 0, itemId);
      this.cartItems = this.cartItems.filter(item => item.id !== itemId);
      this.calculateTotal(); 
    } catch (error) {
      console.error('Erro ao remover o item do carrinho:', error);
    }
  }

  finalizarCompra() {
    this.router.navigate(['/payment-page']);
  }
}


