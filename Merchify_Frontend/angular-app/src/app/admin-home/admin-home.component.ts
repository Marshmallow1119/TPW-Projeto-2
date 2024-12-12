import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { AdminUsersTableComponent } from '../admin-users-table/admin-users-table.component';
import { AdminProductsTableComponent } from '../admin-products-table/admin-products-table.component';
import { ProductsService } from '../products.service';
import { User } from '../models/user';
import { Product } from '../models/produto';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  standalone: true,
  styleUrls: ['./admin-home.component.css'],
  imports: [AdminUsersTableComponent, AdminProductsTableComponent],
})
export class AdminHomeComponent  {

  constructor() {}

}
