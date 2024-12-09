import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistsCardComponent } from '../artists-card/artists-card.component';
import { Artist } from '../models/artista';
import { ArtistsService } from '../artists.service';
import { RouterModule } from '@angular/router';


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
  userType: string = 'individual'; 

  constructor(private artistsService: ArtistsService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.artists = await this.artistsService.getArtistas();
      console.log('Artistas carregados:', this.artists);
    } catch (error) {
      console.error('Error fetching Artistas:', error);
    }
    }
  
}
