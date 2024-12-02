import { User } from "./user";
import { Product } from "./produto";


export interface Purchase {
    id?: number;
    user: User;
    date: Date;
    paymentMethod: string;
    shippingAddress: string;
    status: string;
    total_amount: number;
    discount_applied: boolean;
    discount_value: number;
    purchase_products: PurchaseProduct[];
  }
  
  export interface PurchaseProduct {
    id?: number;
    purchase: Purchase;
    product: Product;
    quantity: number;
    total: number;
  }
  