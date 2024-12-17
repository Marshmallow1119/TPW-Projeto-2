import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-ban-user-modal',
  templateUrl: './ban-user-modal.component.html',
  styleUrls: ['./ban-user-modal.component.css'],
  imports: [CommonModule],
})
export class BanUserModalComponent {
  @Input() isModalOpen = false; 
  @Input() selectedUserId: number | null = null; 
  @Input() actionType: 'ban' | 'unban' = 'ban'; 

  @Output() closeModalEvent = new EventEmitter<void>(); 
  @Output() confirmActionEvent = new EventEmitter<number>();

  closeModal(): void {
    this.closeModalEvent.emit(); 
  }

  confirmAction(): void {
    if (this.selectedUserId !== null) {
      this.confirmActionEvent.emit(this.selectedUserId); 
    }
    this.closeModal();
  }
}
