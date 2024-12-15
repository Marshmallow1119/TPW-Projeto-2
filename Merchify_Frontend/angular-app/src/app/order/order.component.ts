import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

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