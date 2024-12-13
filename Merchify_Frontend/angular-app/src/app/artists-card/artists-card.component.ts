import { Component, Input } from '@angular/core';
import { Artist } from '../models/artista';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../favorites.service';

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

  constructor(private favoriteService: FavoritesService) {}

  toggleFavorite(event: Event, artistId: number): void {
    event.preventDefault(); // Prevents default behavior of the <a> tag
    event.stopPropagation(); // Stops the event from propagating to p
    if (this.artist.is_favorited) {
      this.favoriteService.removeFavoriteArtist(artistId);
      this.artist.is_favorited = false;
    }
    else {
      this.favoriteService.addFavoriteArtist(artistId);
      this.artist.is_favorited = true;
    }
  }
  
}
