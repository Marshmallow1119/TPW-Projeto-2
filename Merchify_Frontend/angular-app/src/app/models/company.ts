export interface Company {
    id: number;
    name: string;
    address?: string;
    email: string;
    phone: string;
    image?: string;
    productCount: number;  
    averageRating: number;
    isFavorited: boolean; 
  }