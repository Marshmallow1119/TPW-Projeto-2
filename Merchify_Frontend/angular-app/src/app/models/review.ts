import { User } from "./user";
import { Product } from "./produto";

export interface Review {
    id?: number;
    user: User;
    product: Product;
    text?: string;
    rating?: number;
    date: Date;
  }
  