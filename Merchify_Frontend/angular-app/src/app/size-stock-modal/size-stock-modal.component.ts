import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-size-stock-modal',
  templateUrl: './size-stock-modal.component.html',
  styleUrls: ['./size-stock-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class SizeStockModalComponent {
  @Input() isModalOpen: boolean = false;
  @Input() productStockSize: { size: string; stock: number }[] | null = null;

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() saveChangesEvent = new EventEmitter<{ size: string; stock: number }[]>();

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  saveChanges(): void {
    if (this.productStockSize) {
      this.saveChangesEvent.emit(this.productStockSize);
    }
    this.closeModal();
  }
}
