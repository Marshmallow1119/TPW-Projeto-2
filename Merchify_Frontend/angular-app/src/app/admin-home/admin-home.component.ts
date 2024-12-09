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
export class AdminHomeComponent implements OnInit {
  users: User[] = [];
  products: Product[] = [];


  constructor(private usersService: UsersService, private productsService: ProductsService) {}

  async ngOnInit(): Promise<void> {
    await this.fetchUsers();
    
  }

  async fetchUsers(): Promise<void> {
    try {
      this.users = await this.usersService.getUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  async fetchProducts(): Promise<void> {
    try {
      this.products = await this.productsService.getProducts();
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
}
