import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { ProductsListComponent } from '../products-list/products-list.component';
import { Product } from '../models/produto';
import { HomeService } from '../home.service';
import { ArtistsListComponent } from '../artists-list/artists-list.component';
import { User } from '../models/user';
import { AuthService } from '../auth.service';
import { ProfileService } from '../profile.service';
import { ThemeService } from '../theme.service';
import { CountdownModule } from 'ngx-countdown';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule,ProductsListComponent,ArtistsListComponent, CountdownModule],  
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  showPromotion: boolean = true;
  homeService: HomeService = inject(HomeService);
  recentProducts: Product[] = [];
  artists: any[] = [];
  user: User | null = null;
  isAuthenticaded: boolean = false;
  purchases: any[] = [];
  numberOfPurchases: number = 0;
  userType: string = ''; 
  theme: string = 'default'; 
  
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

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private themeService: ThemeService
  ) {
    this.themeService.theme$.pipe(
      switchMap((theme) => {
        console.log('NavbarComponent received theme:', theme);
        this.theme = theme;
        return this.loadHomeData(); 
      })
    ).subscribe();
    this.themeService.theme$.subscribe((theme) => {
      console.log('NavbarComponent received theme:', theme);
      this.theme = theme;
    });
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (this.authService.isAuthenticated()) {
        this.isAuthenticaded = true;
        this.userType = user?.user_type || '';
      }
    });
    this.loadHomeData();
  }

  async loadHomeData() {
    try {
      const data = await this.homeService.getHomeData();
      this.artists = data.artists;
      this.recentProducts = data.recent_products;
    } catch (error) {
      console.error('Erro ao carregar dados da home:', error);
    }
  }

  async loadProfile(): Promise<void> {
    try {
      const data = await this.profileService.getProfile();

      this.user = data.user;

      console.log("user", this.user)
      this.purchases = data.purchases;
      this.numberOfPurchases = data.number_of_purchases;
      console.log(this.numberOfPurchases)


    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }
  getTimeUntilChristmas(): number {
    const now = new Date();
    const christmas = new Date(now.getFullYear(), 11, 25); 

    if (now > christmas) {
      christmas.setFullYear(now.getFullYear() + 1);
    }

    return Math.floor((christmas.getTime() - now.getTime()) / 1000);
  }
}

