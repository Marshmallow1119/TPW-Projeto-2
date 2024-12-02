export interface User {
    id: number; 
    username: string;
    firstname?: string;
    lastname?: string; 
    user_type: 'individual' | 'company' | 'admin'; // Restricted to defined user types
    number_of_purchases: number;
    address?: string; 
    email?: string; 
    phone?: string;
    country?: string; 
    image?: string; 
    company?: {
      id: number;
      name: string;
    } | null; 
  }
  