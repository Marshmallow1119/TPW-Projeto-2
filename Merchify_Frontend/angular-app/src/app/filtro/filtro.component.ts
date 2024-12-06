import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class FiltroComponent {
  @Output() filtersChanged = new EventEmitter<any>();
  @Input() genres: string[] = []; // Adicionado como Input
  @Input() colors: string[] = []; // Adicionado como Input

  // Propriedade adicionada para corrigir o erro
  sizes: string[] = ['S', 'M', 'L'];

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

  // Método para exibir filtros com base no tipo de produto selecionado
  showFilters(type: string): void {
    this.selectedType = type;
  }

  // Método para aplicar filtros
  applyFilters(): void {
    this.filtersChanged.emit(this.filters);
  }

  // Método para redefinir filtros
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
