import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompaniesService } from '../companhia.service';
import { Company } from '../models/company';
import { CompanhiasCardComponent } from '../companhias-card/companhias-card.component';

@Component({
  selector: 'app-companies-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CompanhiasCardComponent],
  templateUrl: './companhias-page.component.html',
  styleUrls: ['./companhias-page.component.css'],
})
export class CompaniesPageComponent implements OnInit {
  companies: Company[] = [];
  isAuthenticated: boolean = false; // Replace with actual authentication logic
  userType: string = 'individual'; // Replace with actual user type logic

  constructor(private companiesService: CompaniesService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.companies = await this.companiesService.getCompanies();
      console.log('Companhias carregados:', this.companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }
}
