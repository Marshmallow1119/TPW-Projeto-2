
import { Artist } from "./artista";
import { Company } from "./company";
import { Size } from "./size";



export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string; // URL to the product image
    artist?: Artist;
    company: Company;
    category: string;
    addedProduct: Date;
    count: number;
    is_favorited?: boolean; // Add this property
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
  