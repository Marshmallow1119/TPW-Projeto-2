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
  @Input() title: string = ''; 
  @Input() artists: Artist[] = [];
  @Input() showButton: boolean = false; 
  @Input() buttonLabel: string = 'View All Artists';
  @Input() buttonLink: string = '/artists'; 
}