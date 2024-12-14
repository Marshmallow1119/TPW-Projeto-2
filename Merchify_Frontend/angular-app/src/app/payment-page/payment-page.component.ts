import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';
import { PaymentPageService } from '../payment-page.service';
import { User } from '../models/user';
import { Cart } from '../models/cart';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [DecimalPipe, CurrencyPipe],
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css'], 
})
export class PaymentPageComponent implements OnInit {
  cart: Cart | null = null;
  cartItems: any[] = [];
  cartTotal: number = 0;
  subtotal: number = 0;  
  user: User | null = null;

  discountApplied: boolean = false;
  discountValue: number = 0;
  shippingCost: number = 5.0;
  finalTotal: number = 0;

  paymentMethod: string = '';
  shippingAddress: string = '';
  discountCode: string = '';

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private paymentService: PaymentPageService
  ) {}

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
      const response = await this.cartService.getCart(userId);
      if (response && response.cart_items) {
        this.cartItems = response.cart_items;
        this.calculateCartTotal();
        this.calculateFinalTotal();
      }
    } catch (error) {
      console.error('Erro ao carregar o carrinho:', error);
    }
  }

  calculateCartTotal() {
    this.cartTotal = this.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  calculateFinalTotal() {
    this.finalTotal = this.cartTotal + this.shippingCost - (this.discountValue || 0);
  }

  async applyDiscount() {
    if (!this.discountCode) {
      alert('Por favor, insira um código de desconto.');
      return;
    }

    const result = await this.paymentService.applyDiscount(this.discountCode);

    if (result.success) {
      this.discountApplied = true;
      this.discountValue = result.discountValue || 0;
      this.calculateFinalTotal();
      alert(`Desconto de €${this.discountValue.toFixed(2)} aplicado!`);
    } else {
      alert(result.message || 'Erro ao aplicar o desconto.');
    }
  }

  async removeCartItem(itemId: number) {
    try {
      await this.cartService.removeCartItem(this.user?.id || 0, itemId);
      this.cartItems = this.cartItems.filter((item) => item.product.id !== itemId);
      this.calculateCartTotal();
      this.calculateFinalTotal();
    } catch (error) {
      console.error('Erro ao remover o item do carrinho:', error);
    }
  }

  async submitPayment() {
    if (!this.paymentMethod || !this.shippingAddress) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const paymentData = {
      payment_method: this.paymentMethod,
      shipping_address: this.shippingAddress,
      discount_code: this.discountCode || undefined,
    };

    const result = await this.paymentService.submitPayment(paymentData);

    if (result.success) {
      alert('Pagamento processado com sucesso!');
      this.router.navigate(['/thank-you']); // Redirect to thank-you page
    } else {
      alert(result.message || 'Erro ao processar o pagamento.');
    }
  }
}
