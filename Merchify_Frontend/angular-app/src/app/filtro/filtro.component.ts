import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule], // Removed RouterLink
})
export class FiltroComponent {
  @Output() filtersChanged = new EventEmitter<any>();

  // Declare required properties
  productTypes = [
    { value: 'Vinil', label: 'Vinil' },
    { value: 'CD', label: 'CD' },
    { value: 'Clothing', label: 'Roupas' },
    { value: 'Accessory', label: 'Outros' },
  ];

  selectedType: string = '';
  filters = {
    genreVinyl: '',
    genreCD: '',
    colorClothing: '',
    colorAccessory: '',
    size: '',
    min_price: null,
    max_price: null,
  };

  genres = ['Rock', 'Jazz', 'Pop', 'Classical'];
  colors = ['Red', 'Blue', 'Green', 'Black', 'White'];
  sizes = ['S', 'M', 'L'];

  // Method to show filters based on the selected type
  showFilters(type: string): void {
    this.selectedType = type;
  }

  // Method to apply filters
  applyFilters(): void {
    this.filtersChanged.emit(this.filters);
  }

  // Method to reset filters
  resetFilters(): void {
    this.filters = {
      genreVinyl: '',
      genreCD: '',
      colorClothing: '',
      colorAccessory: '',
      size: '',
      min_price: null,
      max_price: null,
    };
    this.selectedType = '';
    this.filtersChanged.emit(this.filters);
  }
}
