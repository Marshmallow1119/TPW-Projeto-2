import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsPageComponent } from './products-page/products-page.component';
import { ArtistsPageComponent } from './artists-page/artists-page.component';
import { CompaniesPageComponent } from './companhias-page/companhias-page.component'; // Correct name
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ArtistsProductsComponent } from './artists-products/artists-products.component';
import { CompanyProductsComponent } from './company-products/company-products.component';
import { SearchResultsComponent } from './search-results/search-results.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Home Route
  { path: 'products-page', component: ProductsPageComponent },
  { path: 'artists-page', component: ArtistsPageComponent },
  { path: 'companhias-page', component: CompaniesPageComponent },
  { path: 'search-results', component: SearchResultsComponent },
,
  { path: 'product/:identifier', component: ProductDetailsComponent },
  { path: 'products/:artistName', component:  ArtistsProductsComponent},
  { path: 'company/:company_id/products', component: CompanyProductsComponent },
];
