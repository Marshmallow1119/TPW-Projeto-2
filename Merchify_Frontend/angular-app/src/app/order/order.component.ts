import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../profile.service';
import { User } from '../models/user';
import { Product } from '../models/produto';


@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  @Input() order: any;
  isModalOpen = false;
  selectedOrder: any | null = null;
  user: User | null = null;
  purchases: any[] = [];
  numberOfPurchases: number = 0;
  products: Product[] = [];
  products_details: any[] = [];
  constructor(private profileService: ProfileService) {}
  ngOnInit(): void {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    try {
      const data = await this.profileService.getProfile();

      this.user = data.user;
      this.purchases = data.purchases;
      this.products = this.purchases.flatMap(purchase => purchase.products);
      this.numberOfPurchases = data.number_of_purchases;

      

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }

  viewDetails(): void {
    this.selectedOrder = this.order;
    this.isModalOpen = true;
    console.log('Detalhes da Encomenda:', this.selectedOrder);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  preventClose(event: MouseEvent): void {
    event.stopPropagation();
  }
}