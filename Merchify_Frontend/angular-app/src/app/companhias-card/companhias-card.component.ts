import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Company } from '../models/company';

@Component({
  selector: 'app-companhias-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './companhias-card.component.html',
  styleUrls: ['./companhias-card.component.css']
})
export class CompanhiasCardComponent {
  @Input() company!: Company;
  @Input() isAuthenticated!: boolean;
  @Input() userType!: string;

  toggleFavorite(): void {
    console.log(`Toggle favorite for company: ${this.company.id}`);
  }
}
