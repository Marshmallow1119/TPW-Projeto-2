import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsPageComponent } from './products-page/products-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Home Route
  { path: 'products-page', component: ProductsPageComponent },

];
