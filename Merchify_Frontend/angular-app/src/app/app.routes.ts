import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsPageComponent } from './products-page/products-page.component';
import { ArtistsPageComponent } from './artists-page/artists-page.component';
import { CompaniesPageComponent } from './companhias-page/companhias-page.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ArtistsProductsComponent } from './artists-products/artists-products.component';
import { CompanyProductsComponent } from './company-products/company-products.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { CartComponent } from './cart/cart.component';
import { PaymentPageComponent } from './payment-page/payment-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Home Route
  { path: 'products-page', component: ProductsPageComponent },
  { path: 'artists-page', component: ArtistsPageComponent },
  { path: 'companhias-page', component: CompaniesPageComponent },
  { path: 'search-results', component: SearchResultsComponent },
  { path: 'product/:identifier', component: ProductDetailsComponent },
  { path: 'products/:artistName', component:  ArtistsProductsComponent},
  { path: 'company/:company_id/products', component: CompanyProductsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }, 
  { path: 'admin-home', component: AdminHomeComponent }, 
  { path: 'favorites', component: FavoritesComponent }, 
  { path: 'manage_cart', component: CartComponent },
  { path: 'payment-page', component: PaymentPageComponent },
 

  
];
