import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { CompaniesService } from '../companhia.service';
import { Company } from '../models/company';
import { CommonModule } from '@angular/common';
import { BanCompanyModalComponent } from '../ban-company-modal/ban-company-modal.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-company-table',
  imports: [CommonModule, RouterModule,BanCompanyModalComponent],
  templateUrl: './admin-company-table.component.html',
  styleUrl: './admin-company-table.component.css'
})
export class AdminCompanyTableComponent implements OnInit {
  companies: Company[] = [];
  selectedCompanyId: number | null = null;

  constructor (private companyService: CompaniesService) {}

  async ngOnInit(): Promise<void> {
    this.companies = await this.companyService.getCompanies();
    console.log('Companies:', this.companies);
  }

  openBanCompanyModal(companyId: number): void {
    console.log('Opening modal for company:', companyId);
    this.selectedCompanyId = companyId;
    console.log('Selected company ID:', this.selectedCompanyId);
  }

  closeBanCompanyModal(): void {
    this.selectedCompanyId = null;
  }

  async onConfirmBan(companyId: number): Promise<void> {
    try {
      await this.companyService.banCompany(companyId);
      this.companies = this.companies.filter(company => company.id !== companyId); 
    } catch (error) {
      console.error('Error banning company:', error);
    } finally {
      this.closeBanCompanyModal();
    }
  }

}
