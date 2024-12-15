import { Injectable } from '@angular/core';
import { CONFIG } from './config';
import { Review } from './models/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor() { }

  async getReviews(productId: number): Promise<Review[]> {
    const url = `${this.baseUrl}/reviews/${productId}/`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }
      const reviews: Review[] = (await response.json()) ?? [];
      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  async addReview(review: Review, productId: number): Promise<any> {
    const url = `${this.baseUrl}/reviews/${productId}/`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        throw new Error('Failed to add review');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

}