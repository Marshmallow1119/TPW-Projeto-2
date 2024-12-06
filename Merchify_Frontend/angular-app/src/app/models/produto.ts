import { Artist } from './artista';
import { Company } from './company';
import { Size } from './size';

export interface Product {
  id: number;
  name: string;
  description?: string; // Optional, as per the model
  price: number;
  image?: string; // URL to the product image, optional
  artist?: Artist;
  company: Company;
  category: string;
  addedProduct: Date;
  count: number;
  is_favorited?: boolean; // Optional
  average_rating?: string | number; // Add to match `get_average_rating()`
  product_type?: string; // Add to match `get_product_type()`
  stock?: number; // Add to match `get_stock()`
}

export interface Vinil extends Product {
  genre: string;
  lpSize: string;
  releaseDate: Date;
  stock: number;
}

export interface CD extends Product {
  genre: string;
  releaseDate: Date;
  stock: number;
}

export interface Clothing extends Product {
  color: string;
  sizes: Size[];
}

export interface Accessory extends Product {
  material: string;
  color: string;
  size: string;
  stock: number;
}
