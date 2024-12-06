import { Component } from '@angular/core';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  searchQuery: string = '';
  artists: any[] = [];
  products: any[] = [];
  isLoading: boolean = false;

  constructor(private searchService: SearchService) {}

  async onSearch(): Promise<void> {
    if (!this.searchQuery.trim()) {
      this.artists = [];
      this.products = [];
      return;
    }

    this.isLoading = true;

    try {
      const results = await this.searchService.search(this.searchQuery);
      this.artists = results.artists;
      this.products = results.products;
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
