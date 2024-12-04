import { Injectable } from '@angular/core';
import { Route } from '@angular/router';
import { Router } from 'express';

@Injectable({
  providedIn: 'root'
})
export class ArtistsService {
  //private baseUrl :string = 'http://localhost:4200/ws/';
  
  constructor(private router:Router) { }


}
