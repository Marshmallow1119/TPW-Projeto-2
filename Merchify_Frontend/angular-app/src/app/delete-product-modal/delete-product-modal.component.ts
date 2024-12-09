import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-delete-product-modal',
  templateUrl: './delete-product-modal.component.html',
  styleUrls: ['./delete-product-modal.component.css']
})
export class DeleteProductModalComponent {
  @Input() productName: string = ''; // Product name to display
  @Input() productId: number | null = null; // Product ID
  @Output() confirmDelete: EventEmitter<number> = new EventEmitter<number>(); // Emit when confirmed

  onDelete(): void {
    if (this.productId) {
      this.confirmDelete.emit(this.productId);
    }
  }
}
