import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailsService } from '../product-details.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';
import { User } from '../models/user';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  sizes: any[] = [];
  selectedSize: number | null = null;
  averageRating: number = 0;
  userRating: number = 0;
  reviewText: string = '';
  quantity: number = 1;
  loading: boolean = false;
  errorMessage: string = '';
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private productDetailsService: ProductDetailsService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('identifier'));
    this.loadProductDetails(productId);
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  private async loadProductDetails(productId: number): Promise<void> {
    this.loading = true;
    try {
      this.product = await this.productDetailsService.getProductDetails(productId);
      this.sizes = this.product.sizes || [];
      this.averageRating = this.product.average_rating || 0;
      console.log('Product details loaded:', this.product);
    } catch (error) {
      console.error('Error loading product details:', error);
      this.errorMessage = 'Erro ao carregar os detalhes do produto. Tente novamente mais tarde.';
    } finally {
      this.loading = false;
    }
  }

  selectSize(sizeId: number): void {
    this.selectedSize = sizeId;
  }

  submitReview(rating: number, text: string): void {
    if (!rating) {
      alert('Por favor, selecione uma avaliação.');
      return;
    }

    const reviewData = {
      rating,
      text: text || null,
    };

    console.log('Review submitted:', reviewData);
  }

  async addToCart(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.product.product_type === 'Clothing' && !this.selectedSize) {
      alert('Por favor, selecione um tamanho.');
      return;
    }

    if (!this.quantity || this.quantity < 1) {
      alert('A quantidade deve ser no mínimo 1.');
      return;
    }

    const data = {
      quantity: this.quantity,
      size: this.selectedSize,
    };

    try {
      const userId = this.authService.getUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado.');
      }

      const productId = this.product.id;
      console.log('Adicionando ao carrinho:', { userId, productId, data });

      const response = await this.cartService.addToCart(userId, productId, data);
      console.log('Produto adicionado ao carrinho:', response);

      alert('Produto adicionado ao carrinho com sucesso!');
      await this.loadProductDetails(productId); // Reload product details to update stock
      this.router.navigate(['/manage_cart']);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      alert('Erro ao adicionar o produto ao carrinho. Tente novamente.');
    }
  }

  isNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
}
