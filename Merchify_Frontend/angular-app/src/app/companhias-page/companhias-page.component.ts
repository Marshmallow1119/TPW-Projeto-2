import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompaniesService } from '../companhia.service';
import { Company } from '../models/company';
import { CompanhiasCardComponent } from '../companhias-card/companhias-card.component';
import { FavoritesService } from '../favorites.service';
import { User } from '../models/user';
import { AuthService } from '../auth.service';


interface FavoriteCompany {
  id: number;
  user: number;
  company: Company;
}

@Component({
  selector: 'app-companies-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CompanhiasCardComponent],
  templateUrl: './companhias-page.component.html',
  styleUrls: ['./companhias-page.component.css'],
})
export class CompaniesPageComponent implements OnInit {
  companies: Company[] = [];
  isAuthenticated: boolean = false; 
  user: User | null = null;
  userType: string = ''; 


  constructor(private companiesService: CompaniesService, private favoriteService: FavoritesService, private authService: AuthService) {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      this.isAuthenticated = this.authService.isAuthenticated();
      this.userType = user?.user_type || '';
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.companies = await this.companiesService.getCompanies();
      let favoriteCompanies: FavoriteCompany[] = await this.favoriteService.getFavorites("company");
      for (let company of this.companies) {
        company.is_favorited = favoriteCompanies.some(favoriteCompanies => favoriteCompanies.company.id === company.id);
      }
      console.log('user:', this.user);
    } catch (error) {
      console.error('Error fetching Companhias:', error);
    }
  }
}
