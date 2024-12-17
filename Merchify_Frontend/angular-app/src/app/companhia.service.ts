import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Company } from './models/company';
import { CONFIG } from './config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompaniesService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor(private router: Router) {}

  async getCompanies(): Promise<Company[]> {
    const url = `${this.baseUrl}/companhias/`;
    try {
      const response: Response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }
      const companies: Company[] = (await response.json()) ?? [];
      return companies;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  async toggleFavorite(companyId: number): Promise<{ favorited: boolean }> {
    try {
      const response = await fetch(
        `${this.baseUrl}favorites/add/company/${companyId}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyId }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }
      return await response.json();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  async banCompany(companyId: number): Promise<Company> {
    const url = `${this.baseUrl}/company/${companyId}/`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to ban company');
      }
      return await response.json();
    } catch (error) {
      console.error('Error banning company:', error);
      throw error;
    }
  }

  async addCompany(data: FormData): Promise<any> {
    const url = `${this.baseUrl}/company/`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: data,
      });
      if (!response.ok) {
        throw new Error('Failed to add company');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding company:', error);
      throw error;
    }
  }

  async getCompany(companyId: number): Promise<Company> {
    const token = localStorage.getItem('accessToken');
    const url = `${this.baseUrl}/company/${companyId}/`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch company');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  }

}
