import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../cart.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { User } from '../models/user';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  cartTotal: number = 0;
  user: User | null = null; // Armazena o usuário autenticado

  constructor(private cartService: CartService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Obter o usuário autenticado
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (this.user?.id) {
        this.loadCart(this.user.id); // Carregar o carrinho após obter o userId
      }
    });
  }

  async loadCart(userId: number) {
    try {
      console.log('userId:', userId);
      const response = await this.cartService.getCart(userId); // Usando o userId correto
      this.cartItems = response.cart_items || [];
      this.calculateTotal();
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

  async updateCartItem(item: any) {
    try {
      await this.cartService.updateCartItem(1, item.id, { quantity: item.quantity });
      this.calculateTotal();
    } catch (error) {
      console.error('Erro ao atualizar o item do carrinho:', error);
    }
  }

  async removeCartItem(itemId: number) {
    try {
      await this.cartService.removeCartItem(1, itemId);
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