import { Injectable } from "@angular/core";

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
        if (user.image) {
          const blob = this.base64toBlob(user.image, 'image/png');
          user.image = URL.createObjectURL(blob);
        }
      }

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  private base64toBlob(base64: string, contentType: string = ''): Blob {
    const byteCharacters = atob(base64);
    const byteArrays: Uint8Array[] = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length).fill(0).map((_, i) => slice.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }
}
