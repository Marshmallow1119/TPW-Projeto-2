import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompaniesService } from '../companhia.service';
import { Company } from '../models/company';
import { CompanhiasCardComponent } from '../companhias-card/companhias-card.component';
import { FavoritesService } from '../favorites.service';

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
  userType: string = 'individual'; 

  constructor(private companiesService: CompaniesService, private favoriteService: FavoritesService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.companies = await this.companiesService.getCompanies();
      let favoriteCompanies: FavoriteCompany[] = await this.favoriteService.getFavorites("company");
      console.log('Companhias favoritos:', favoriteCompanies);
      for (let company of this.companies) {
        company.is_favorited = favoriteCompanies.some(favoriteCompanies => favoriteCompanies.company.id === company.id);
      }
      console.log('Companhias carregados:', this.companies);
    } catch (error) {
      console.error('Error fetching Companhias:', error);
    }
  }
}
