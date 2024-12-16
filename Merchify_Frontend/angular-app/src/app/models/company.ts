
  export interface Company {
    id: number;
    name: string;
    address?: string;
    email: string;
    phone: string;
    image_url?: string; 
    product_count: number; 
    average_rating: number | string; 
    is_favorited: boolean; 
  }