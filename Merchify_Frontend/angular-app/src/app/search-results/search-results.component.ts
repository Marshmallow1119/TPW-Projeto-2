import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../search.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { ArtistsCardComponent } from '../artists-card/artists-card.component';
import { ProductsListComponent } from '../products-list/products-list.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../models/produto';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
  imports:[CommonModule, ArtistsCardComponent, RouterModule, ProductCardComponent]
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string = '';
  artists: any[] = [];
  products: Product[] = [];
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['query'] || '';
      if (this.searchQuery.trim()) {
        this.fetchSearchResults(this.searchQuery);
      }
    });
  }

  async fetchSearchResults(query: string): Promise<void> {
    this.isLoading = true;
    try {
      const results = await this.searchService.search(query);
      this.artists = results.artists;
      console.log('Artists:', this.artists); 
      this.products = results.products;
      console.log('Products:', this.products);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
