export interface User {
    id: number; 
    username: string;
    firstname: string;
    lastname: string; 
    user_type: 'individual' | 'company' | 'admin'; 
    number_of_purchases: number | 0;
    address: string; 
    email: string; 
    phone: string;
    country: string; 
    image?: string; 
    company?: {
      id: number;
      name: string;
    } | null; 
  }
  