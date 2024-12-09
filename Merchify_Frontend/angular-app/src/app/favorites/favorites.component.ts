import { Component, OnInit } from '@angular/core';
import { FavoritesService } from '../favorites.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule,RouterModule],
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  category: string = 'products'; // Categoria inicial
  favoriteProducts: any[] = [];
  favoriteArtists: any[] = [];
  favoriteCompanies: any[] = [];

  constructor(private favoritesService: FavoritesService) { }

  ngOnInit(): void {
    this.loadProducts();
  }
  

  // Alterna entre categorias
  switchCategory(category: string): void {
    this.category = category;

    // Chama a função correspondente à categoria
    if (category === 'products') {
      this.loadProducts();
    } else if (category === 'artists') {
      this.loadArtists();
    } else if (category === 'companies') {
      this.loadCompanies();
    }
  }

  // Funções para carregar favoritos
  async loadProducts(): Promise<void> {
    this.favoriteProducts = await this.favoritesService.getFavorites('products');
  }

  async loadArtists(): Promise<void> {
    this.favoriteArtists = await this.favoritesService.getFavorites('artists');
  }

  async loadCompanies(): Promise<void> {
    this.favoriteCompanies = await this.favoritesService.getFavorites('companies');
  }

  // Funções para remover favoritos
  async removeProductFromFavorites(id: number): Promise<void> {
    await this.favoritesService.removeFavorite(id);
    this.favoriteProducts = this.favoriteProducts.filter(product => product.id !== id);
  }

  async removeArtistFromFavorites(id: number): Promise<void> {
    await this.favoritesService.removeFavoriteArtist(id);
    this.favoriteArtists = this.favoriteArtists.filter(artist => artist.id !== id);
  }

  async removeCompanyFromFavorites(id: number): Promise<void> {
    await this.favoritesService.removeFavoriteCompany(id);
    this.favoriteCompanies = this.favoriteCompanies.filter(company => company.id !== id);
  }
}
