import { Injectable } from "@angular/core";
import { base64toBlob } from "./utils";
import { CONFIG } from "./config";

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private baseUrl: string = CONFIG.baseUrl;

  constructor() {}

  async getUsers(): Promise<any[]> {
    const url = `${this.baseUrl}/users/`;
    try {
      const response = await fetch(url);
      const users = await response.json() ?? [];

      for (const user of users) {
        console.log('User:', user);
        if (user.image) {
          const blob = base64toBlob(user.image, 'image/png');
          user.image = URL.createObjectURL(blob);
        }
        else {
          user.image = 'assets/default_user.jpg';
        }
      }

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async banUser(userId: number): Promise<void> {
    const url = `${this.baseUrl}/user/${userId}/ban/`;
    try {
      console.log(localStorage.getItem('accessToken'));
      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }


}
