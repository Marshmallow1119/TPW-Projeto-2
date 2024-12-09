import { Component, Input } from '@angular/core';
import { UsersService } from '../users.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../models/user';

@Component({
  selector: 'app-admin-users-table',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './admin-users-table.component.html',
  styleUrl: './admin-users-table.component.css',
})
export class AdminUsersTableComponent {
  @Input() users: User[] = [];

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


