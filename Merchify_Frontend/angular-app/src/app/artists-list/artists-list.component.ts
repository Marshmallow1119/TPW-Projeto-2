import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../models/produto';
import { Artist } from '../models/artista';

@Component({
  selector: 'app-artists-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './artists-list.component.html',
  styleUrl: './artists-list.component.css'
})
export class ArtistsListComponent {
  @Input() title: string = ''; // Title for the list
  @Input() artists: Artist[] = []; // List of artists
  @Input() showButton: boolean = false; // Flag to show the button
  @Input() buttonLabel: string = 'View All Artists'; // Button text
  @Input() buttonLink: string = '/artists'; // Link for the button
}