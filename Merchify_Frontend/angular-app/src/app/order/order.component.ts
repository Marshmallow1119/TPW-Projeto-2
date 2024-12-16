import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user';
import { Product } from '../models/produto';


@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent {
  @Input() order: any;
  isModalOpen = false;
  selectedOrder: any | null = null;
  user: User | null = null;
  purchases: any[] = [];
  numberOfPurchases: number = 0;
  products: Product[] = [];
  products_details: any[] = [];
  constructor() {}

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