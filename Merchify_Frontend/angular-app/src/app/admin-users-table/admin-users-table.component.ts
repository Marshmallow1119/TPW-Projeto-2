import { CommonModule } from "@angular/common";
import { User } from "../models/user";
import { UsersService } from "../users.service";
import { RouterModule } from "@angular/router";
import { Component } from "@angular/core";
import { BanUserModalComponent } from "../ban-user-modal/ban-user-modal.component";

@Component({
  selector: 'app-admin-users-table',
  imports: [CommonModule, RouterModule, BanUserModalComponent],
  standalone: true,
  templateUrl: './admin-users-table.component.html',
  styleUrl: './admin-users-table.component.css',
})
export class AdminUsersTableComponent {
  users: User[] = [];
  selectedUserId: number | null = null;

  constructor(private usersService: UsersService) {}

  async ngOnInit(): Promise<void> {
    await this.fetchUsers();
    console.log('Users:', this.users);
  }

  async fetchUsers(): Promise<void> {
    try {
      this.users = await this.usersService.getUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  openBanUserModal(userId: number): void {
    this.selectedUserId = userId;
  }

  closeBanUserModal(): void {
    this.selectedUserId = null;
  }

  async onConfirmBan(userId: number): Promise<void> {
    console.log('Banning user with ID:', userId);
    try {
      await this.usersService.banUser(userId);
      this.users = this.users.filter(user => user.id !== userId); // Update UI
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      this.closeBanUserModal();
    }
  }
}