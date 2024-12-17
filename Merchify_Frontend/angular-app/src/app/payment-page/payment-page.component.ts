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
      // eu vou ignorar que isto foi feito assim e não a usar os models e serializers :(
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
    this.calculateFinalTotal();
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
      this.cartItems = this.cartItems.filter((item) => item.cartItemId !== itemId);
      await this.loadCart(this.user?.id || 0); 
      this.calculateTotal();
      this.calculateFinalTotal();
    } catch (error) {
      console.error('Erro ao remover o item do carrinho:', error);
    }
  }

  getImageSrc(imageBase64: string | null): string {
    if (!imageBase64) {
      return 'assets/images/default-product.png'; 
    }
    return `data:image/jpeg;base64,${imageBase64}`; 
  }

  async submitPayment() {
    if (!this.paymentMethod || !this.shippingAddress) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
  
    const paymentData = {
      payment_method: this.paymentMethod,
      shipping_address: this.shippingAddress,
      discountApplied: this.discountApplied,
      discountValue: this.discountValue,
    };
  
    const loader = document.getElementById('loading-indicator');
    if (loader) loader.style.display = 'block'; 
  
    try {
      const result = await this.paymentService.submitPayment(paymentData);
      alert('Pagamento processado com sucesso!');
      this.authService.updateUserBalance(result.new_balance);

      this.router.navigate(['/']); 
    } catch (error: any) {
      alert('Erro inesperado: não foi possível processar o pagamento.');
      console.error('Erro inesperado:', error);
    } finally {
      if (loader) loader.style.display = 'none'; 
    }
  }
  
}
