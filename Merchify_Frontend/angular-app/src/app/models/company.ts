
  export interface Company {
    id: number;
    name: string;
    address?: string;
    email: string;
    phone: string;
    logo_base64?: string; 
    product_count: number; 
    average_rating: number | string; 
    is_favorited: boolean; 
  }