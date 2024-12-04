import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../models/produto';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css'], // Ensure correct property name
})
export class ProductsListComponent {
  @Input() title: string = ''; // Title of the section
  @Input() products: Product[] = []; // Products list to display
  @Input() showButton: boolean = false; // Whether to show the button
  @Input() buttonLabel: string = ''; // Label for the button
  @Input() buttonLink: string = ''; // Link for the button
}
