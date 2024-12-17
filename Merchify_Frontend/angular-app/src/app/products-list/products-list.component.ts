import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../models/produto';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css'], 
})
export class ProductsListComponent {
  @Input() title: string = ''; 
  @Input() products: Product[] = []; 
  @Input() showButton: boolean = false; 
  @Input() buttonLabel: string = ''; 
  @Input() buttonLink: string = ''; 
}
