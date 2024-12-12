import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-delete-product-modal',
  templateUrl: './delete-product-modal.component.html',
  styleUrls: ['./delete-product-modal.component.css'],
  standalone: true,
})
export class DeleteProductModalComponent {
  @Input() productName: string = ''; 
  @Input() productId: number | null = null; 
  @Output() confirmDelete: EventEmitter<number> = new EventEmitter<number>();

  onDelete(): void {
    if (this.productId) {
      this.confirmDelete.emit(this.productId);
    }
  }
}
