import { Clothing } from './produto';

export interface Size {
  id?: number;           
  clothing: Clothing;    
  size: string;          
  stock: number;         
}
