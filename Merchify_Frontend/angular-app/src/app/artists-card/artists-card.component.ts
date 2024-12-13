import { Component, Input } from '@angular/core';
import { Artist } from '../models/artista';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-artists-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artists-card.component.html',
  styleUrl: './artists-card.component.css'
})
export class ArtistsCardComponent {
  @Input() artist!: Artist;
  @Input() isAuthenticated: boolean = false;
  @Input() userType: string = ''

  toggleFavorite(id: number): void {
    console.log(`Toggled favorite for artist ID: ${this.artist.id}`);
  }

}
