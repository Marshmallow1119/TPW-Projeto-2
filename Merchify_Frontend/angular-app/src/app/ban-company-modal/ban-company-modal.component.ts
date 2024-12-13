import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ban-company-modal',
  templateUrl: './ban-company-modal.component.html',
  styleUrls: ['./ban-company-modal.component.css'],
  imports: [CommonModule],
})
export class BanCompanyModalComponent {
  @Input() isModalOpen: boolean = false;
  @Input() selectedCompanyId: number | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() confirmActionEvent = new EventEmitter<number>(); 

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  confirmBan(): void {
    if (this.selectedCompanyId !== null) {
      this.confirmActionEvent.emit(this.selectedCompanyId); // Emit the selected ID as a number
    }
  }
}
