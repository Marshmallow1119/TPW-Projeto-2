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
import { MyCompanyProductsComponent } from './my-company-products/my-company-products.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { ChatComponent } from './chat/chat.component';
import { AddCompanyComponent } from './add-company/add-company.component';
import { ListChatsComponent } from './list-chats/list-chats.component';
import { ProfileComponent } from './profile/profile.component';
import { AddProductComponent } from './add-product/add-product.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Home Route
  { path: 'products-page', component: ProductsPageComponent },
  { path: 'artists-page', component: ArtistsPageComponent },
  { path: 'companhias-page', component: CompaniesPageComponent },
  { path: 'search-results', component: SearchResultsComponent },
  { path: 'product/:identifier', component: ProductDetailsComponent }, // Dynamic Route
  { path: 'products/:artistName', component: ArtistsProductsComponent },
  { path: 'company/:company_id', component: CompanyProductsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }, 
  { path: 'admin-home', component: AdminHomeComponent }, 
  { path: 'favorites', component: FavoritesComponent }, 
  { path: 'manage_cart', component: CartComponent },
  { path: 'payment-page', component: PaymentPageComponent },
  { path: 'chat/:id', component: ChatComponent }, // Dynamic Route
  { path: 'chat', component: ListChatsComponent },
  { path: 'my-company-products/:company_id', component: MyCompanyProductsComponent }, // Dynamic Route
  { path: 'companies/:company_id/products/:product_id/edit', component: EditProductComponent }, // Dynamic Route
  { path: 'profile', component: ProfileComponent },
  { path: 'admin/add/company', component: AddCompanyComponent },
  { path: 'add/product', component: AddProductComponent },
  { path: '**', component: PageNotFoundComponent }, 
];

