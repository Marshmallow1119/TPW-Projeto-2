
import { Size } from "./size";
import { User } from "./user";
import { Product } from "./produto";


export interface Cart {
    id?: number;
    user: User;
    date: Date;
    items: CartItem[];
    total: number;
  }
  
  export interface CartItem {
    id: number;
    cart: Cart;
    product: Product;
    quantity: number;
    size?: Size;
    total: number;
  }
  