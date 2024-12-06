import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { ProductsListComponent } from '../products-list/products-list.component';
import { ProductsService } from '../products.service';
import { Product } from '../models/produto';
import { HomeService } from '../home.service';
import { ArtistsListComponent } from '../artists-list/artists-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule,ProductsListComponent,ArtistsListComponent],  
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  showPromotion: boolean = true;
  homeService: HomeService = inject(HomeService);
  recentProducts: Product[] = [];
  artists: any[] = [];


  user = {
    isAuthenticated: false,
  };

  slides = [
    {
      name: 'Olivia Rodrigo',
      image: 'assets/carrousel_images/gutsTour.jpeg',
      alt: 'Imagem 1'
    },
    {
      name: 'The Beatles',
      image: 'assets/carrousel_images/beatles.png',
      alt: 'Imagem 2'
    },
    {
      name: 'Taylor Swift',
      image: 'assets/carrousel_images/taylor2.jpg',
      alt: 'Imagem 3'
    }
  ];

  constructor() {
    this.loadHomeData();
  }

  async loadHomeData() {
    try {
      const data = await this.homeService.getHomeData();
      this.artists = data.artists;
      this.recentProducts = data.recent_products;
      console.log('Artistas carregados:', this.artists);
      console.log('Produtos recentes carregados:', this.recentProducts);
    } catch (error) {
      console.error('Erro ao carregar dados da home:', error);
    }
  }

}

