import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistsCardComponent } from '../artists-card/artists-card.component';
import { Artist } from '../models/artista';
import { ArtistsService } from '../artists.service';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../favorites.service';
import { User } from '../models/user';
import { AuthService } from '../auth.service';

interface FavoriteArtist {
  id: number;
  user: number;
  artist: Artist;
}

@Component({
  selector: 'app-artists-page',
  standalone: true,
  imports: [CommonModule,RouterModule, ArtistsCardComponent],
  templateUrl: './artists-page.component.html',
  styleUrls: ['./artists-page.component.css'],
})
export class ArtistsPageComponent implements OnInit {
  artists: Artist[] = [];
  isAuthenticated: boolean = false;
  user: User | null = null;
  userType: string = '';

  constructor(private artistsService: ArtistsService, private favoriteService: FavoritesService, private authService: AuthService) {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      this.isAuthenticated = this.authService.isAuthenticated();
      this.userType = user?.user_type || '';
    });
  }

  async ngOnInit(): Promise<void> {
      this.artists = await this.artistsService.getArtistas();
      let favoriteArtists: FavoriteArtist[] = await this.favoriteService.getFavorites("artists");
      console.log('Artistas favoritos:', favoriteArtists);
      for (let artist of this.artists) {
        artist.is_favorited = favoriteArtists.some(favoriteArtist => favoriteArtist.artist.id === artist.id);
      }
      console.log('Artistas carregados:', this.artists);
    }
  }

