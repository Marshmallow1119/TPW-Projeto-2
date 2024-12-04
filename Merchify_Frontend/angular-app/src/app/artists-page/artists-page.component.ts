import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistsCardComponent } from '../artists-card/artists-card.component';
import { Artist } from '../models/artista';
import { ArtistsService } from '../artists.service';


@Component({
  selector: 'app-artists-page',
  standalone: true,
  imports: [CommonModule, ArtistsCardComponent],
  templateUrl: './artists-page.component.html',
  styleUrls: ['./artists-page.component.css'],
})
export class ArtistsPageComponent implements OnInit {
  artists: Artist[] = [];
  isAuthenticated: boolean = false; // Mock; replace with actual auth logic
  userType: string = 'individual'; // Mock; replace with actual user type logic

  constructor(private artistsService: ArtistsService) {}

  async ngOnInit(): Promise<void> {
    this.artists = await this.artistsService.getArtistas();
  }
}
