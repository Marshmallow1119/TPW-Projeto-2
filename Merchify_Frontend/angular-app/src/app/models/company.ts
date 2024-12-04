export interface Company {
    id: number;
    name: string;
    address?: string;
    email: string;
    phone: string;
    image?: string; // URL to the image
    productCount: number; // Total products associated with the company
    averageRating: number; // Average rating of the company
    isFavorited: boolean; // Ensure this is included
  }
  