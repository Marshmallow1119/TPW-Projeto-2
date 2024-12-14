import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class FiltroComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<any>();
  @Input() colors: string[] = []; // Added Input property
  @Input() genres: string[] = []; // Add similar for other properties, if needed
  @Input() sizes: string[] = []; // For sizes if being passed from parent

  productTypes = [
    { value: 'Vinil', label: 'Vinil' },
    { value: 'CD', label: 'CD' },
    { value: 'Clothing', label: 'Roupas' },
    { value: 'Accessory', label: 'Outros' },
  ];

  selectedType: string = '';
  filters = {
    type: '',
    genreVinyl: '',
    genreCD: '',
    colorClothing: '',
    colorAccessory: '',
    size: '',
    min_price: null,
    max_price: null,
  };

  constructor(private productsService: ProductsService) {}


  ngOnInit(): void {
    this.productsService.getFilters().then((filters) => {
      this.genres = filters.genres;
      this.colors = filters.colors;
      this.sizes = filters.sizes;
    });
  }

  showFilters(type: string): void {
    this.selectedType = type;
    this.emitFilterChanges();
  }

  emitFilterChanges(): void {
    this.filters.type = this.selectedType;
    this.filtersChanged.emit(this.filters);
  }

  onFilterChange(): void {
    this.emitFilterChanges();
  }

  resetFilters(): void {
    this.filters = {
      type: '',
      genreVinyl: '',
      genreCD: '',
      colorClothing: '',
      colorAccessory: '',
      size: '',
      min_price: null,
      max_price: null,
    };
    this.selectedType = '';
    this.emitFilterChanges();
  }
}
