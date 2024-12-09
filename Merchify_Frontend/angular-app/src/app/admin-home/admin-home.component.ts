import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { AdminUsersTableComponent } from '../admin-users-table/admin-users-table.component';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  standalone: true,
  styleUrls: ['./admin-home.component.css'],
  imports: [AdminUsersTableComponent],
})
export class AdminHomeComponent implements OnInit {
  users: any[] = [];

  constructor(private usersService: UsersService) {}

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
}
