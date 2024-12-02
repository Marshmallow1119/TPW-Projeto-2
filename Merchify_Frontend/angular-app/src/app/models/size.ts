import { Clothing } from './clothing';

export interface Size {
  id?: number;           
  clothing: Clothing;    
  size: string;          
  stock: number;         
}
