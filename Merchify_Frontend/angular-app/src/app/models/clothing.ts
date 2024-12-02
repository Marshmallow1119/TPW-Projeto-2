import { Product } from './produto';
import { Size } from './size';

export interface Clothing extends Product {
  color: string;
  sizes: Size[]; // Array of sizes available for this clothing item
}
