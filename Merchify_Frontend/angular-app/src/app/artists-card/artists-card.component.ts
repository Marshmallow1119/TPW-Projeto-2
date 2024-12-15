import { Component, Input } from '@angular/core';
import { Artist } from '../models/artista';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FavoritesService } from '../favorites.service';
import { AuthService } from '../auth.service';

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

  constructor(private favoriteService: FavoritesService, private authService: AuthService, private router: Router) {}

  toggleFavorite(event: Event, artistId: number): void {
    event.preventDefault(); 
    event.stopPropagation(); 
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }
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
