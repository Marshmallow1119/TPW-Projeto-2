import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Company } from './models/company';

@Injectable({
  providedIn: 'root',
})
export class CompaniesService {
  private baseUrl = 'http://localhost:8000/ws/';

  constructor(private router: Router) {}

  // Fetch all companies
  async getCompanies(): Promise<Company[]> {
    const url = `${this.baseUrl}companhias/`;
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

  // Toggle favorite for a company
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
}
