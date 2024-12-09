import { Injectable } from "@angular/core";
import { base64toBlob } from "./utils";

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  baseUrl = 'http://localhost:8000/ws';

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


}
