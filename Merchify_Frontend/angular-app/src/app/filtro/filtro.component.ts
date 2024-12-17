import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../products.service';
import { Artist } from '../models/artista';
import { ArtistsService } from '../artists.service';
import { Router } from '@angular/router';
import { Product } from '../models/produto';

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
  @Input() genres: string[] = [];
  @Input() showArtistFilter: boolean = true;
  @Input() sizes: string[] = [];
  @Input() is_on_promotion: Product[] = [];


  artists: Artist[] = [];
  selectedArtist: string = ''; 
  selectedArtistName: string = '';

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
    artist: '', 
    onSale: false,
  };


  constructor(
    private productsService: ProductsService,
    private artistsService: ArtistsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productsService.getFilters().then((filters) => {
      this.genres = filters.genres;
      this.colors = filters.colors;
      this.sizes = filters.sizes;
      this.is_on_promotion = filters.is_on_promotion;
    });

    this.artistsService.getArtistas().then((artists) => {
      this.artists = artists;
    });

  }

  showFilters(type: string): void {
    this.selectedType = type;
    this.emitFilterChanges();
  }

  onFilterChange(): void {
    this.emitFilterChanges();
  }

  onArtistChange(): void {
    this.filters.artist = this.selectedArtist; 
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
      artist: '', 
      onSale: false,
    };
    this.selectedType = '';
    this.selectedArtist = ''; 
    this.emitFilterChanges();
  }

  emitFilterChanges(): void {
    this.filters.type = this.selectedType;
    this.filtersChanged.emit(this.filters);
  }

  selectArtist(artist: Artist): void {
    this.selectedArtist = artist.id.toString();
    this.selectedArtistName = artist.name;
    this.filters.artist = artist.id.toString(); 
    this.emitFilterChanges();
  }
  
}
