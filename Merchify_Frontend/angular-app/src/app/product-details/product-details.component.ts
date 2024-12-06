import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailsService } from '../product-details.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  sizes: any[] = [];
  selectedSize: number | null = null;
  averageRating: number = 0;
  userRating: number = 0;
  reviewText: string = '';
  isAuthenticated: boolean = false; // Adjust with your authentication logic
  quantity: any;
  user: any = { is_authenticated: true, user_type: 'individual' }; // Example user object


  constructor(
    private route: ActivatedRoute,
    private productDetailsService: ProductDetailsService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.params['identifier'];
    this.loadProductDetails(productId);
  }

  // Load product details from the API
  private async loadProductDetails(productId: number): Promise<void> {
    try {
      this.product = await this.productDetailsService.getProductDetails(productId);
      this.sizes = this.product.sizes;
      this.averageRating = this.product.average_rating;
      console.log('Product details loaded:', this.product);
    } catch (error) {
      console.error('Error loading product details:', error);
    }
  }

  // Select size for clothing items
  selectSize(sizeId: number): void {
    this.selectedSize = sizeId;
  }

  submitReview(rating: number, text: string): void {
    if (!rating) {
      alert('Please select a rating.');
      return;
    }
    const reviewData = {
      rating,
      text: text || null,
    };
  
    console.log('Review submitted:', reviewData);
    // Add logic to submit the review to the backend
  }
  

  addToCart(): void {
    console.log('Adding to cart:', { quantity: this.quantity, size: this.selectedSize });
    // Add logic for adding to cart
  }

  isNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
  
}
