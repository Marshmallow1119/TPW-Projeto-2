import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductDetailsService } from '../product-details.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';
import { User } from '../models/user';
import { Review } from '../models/review';
import { ReviewsService } from '../reviews.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  reviews: Review[] = [];

  constructor(
    private route: ActivatedRoute,
    private productDetailsService: ProductDetailsService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private reviewService: ReviewsService
  ) {}

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('identifier'));
    this.loadProductDetails(productId);
    this.reviewService.getReviews(productId).then((reviews) => {
      this.reviews = reviews;
    }).catch((error) => {
      console.error('Error loading reviews:', error);
    });
  
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
    this.loadProductDetails(productId);
  }

  private async loadProductDetails(productId: number): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      const response = await this.productDetailsService.getProductDetails(productId);
  
      console.log('Raw Product details:', response);
  
      // Map the response to the `Product` interface
      this.product = {
        id: response.id,
        name: response.name,
        description: response.description || 'Descrição não disponível.',
        price: response.price,
        image_url: response.image_url,
        artist: response.artist.name, // If `artist` is just an ID, handle accordingly
        company: response.company.name, // If `company` is just an ID, handle accordingly
        category: response.category,
        addedProduct: new Date(response.addedProduct), // Convert to Date object
        count: response.count,
        average_rating: response.average_rating || 0,
        product_type: response.product_type,
        stock: response.stock || 0,
        specific_details: response.specific_details || null,
      };
  
      if (this.product.product_type === 'Clothing') {
        this.sizes = this.product.specific_details.sizes || [];
      } else {
        this.sizes = [];
      }

  
      console.log('Processed Product:', this.product);
      console.log('stock:', this.product.stock);
      console.log('product_type:', this.product.product_type);

      console.log('Sizes:', this.sizes);
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

    if (!this.user) {
      alert('Usuário não autenticado.');
      return;
    }

    const review: Review = {
      user: this.user,
      product: this.product,
      text: reviewData.text || undefined,
      rating: reviewData.rating,
      date: new Date(),
    };

    this.reviewService.addReview(review, this.product.id)
    .then((response) => {
      if (response.status === 'success') { 
        this.reviews.push(review);
        this.reviewText = '';
        this.userRating = 0;
  
        if (review.rating !== undefined) {
          this.averageRating =
            (this.averageRating * (this.reviews.length - 1) + review.rating) / this.reviews.length;
        }
      } else {
        console.error('Failed to add review:', response.message || 'Unknown error');
        alert('Failed to add review: ' + (response.message || 'Unknown error'));
      }
    })
    .catch((error) => {
      console.error('Error adding review:', error);
      alert('An unexpected error occurred while adding the review.');
    });
  
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
