import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { AdminUsersTableComponent } from '../admin-users-table/admin-users-table.component';
import { AdminProductsTableComponent } from '../admin-products-table/admin-products-table.component';
import { ProductsService } from '../products.service';
import { User } from '../models/user';
import { Product } from '../models/produto';
import { AdminCompanyTableComponent } from '../admin-company-table/admin-company-table.component';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  standalone: true,
  styleUrls: ['./admin-home.component.css'],
  imports: [AdminUsersTableComponent, AdminProductsTableComponent, AdminCompanyTableComponent]
})
export class AdminHomeComponent  {

  constructor() {}

}
