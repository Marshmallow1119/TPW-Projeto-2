import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../cart.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { User } from '../models/user';
import { Cart } from '../models/cart';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'] // Corrigido de styleUrl para styleUrls
  })
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  cartItems: any[] = [];
  cartTotal: number = 0;
  user: User | null = null; // Armazena o usuário autenticado

  constructor(private cartService: CartService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (this.user?.id) {
        this.loadCart(this.user.id);
      }
    });
  }

  async loadCart(userId: number) {
    try {
      console.log('userId:', userId);
  
      // Chamada ao serviço para obter o carrinho
      const response = await this.cartService.getCart(userId);
  
      // Verifica se os dados foram retornados corretamente
      if (response && response.cart_items) {
        this.cartItems = response.cart_items.map((item: any) => ({
          id: item.id,
          cart: { 
            id: item.cart, 
            user: this.user as User, 
            date: new Date(), // Ajuste conforme necessário
            items: [], // Será populado depois
            total: 0 // Será calculado
          },
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            imageUrl: item.product.image_url,
            artist: item.product.artist,
            company: item.product.company,
            category: item.product.category,
            addedProduct: item.product.addedProduct,
            count: item.product.count,
            averageRating: item.product.average_rating,
            productType: item.product.product_type,
            stock: item.product.stock,
            specificDetails: {
              id: item.product.specific_details.id,
              name: item.product.specific_details.name,
              genre: item.product.specific_details.genre,
              lpSize: item.product.specific_details.lpSize,
              releaseDate: item.product.specific_details.releaseDate,
              stock: item.product.specific_details.stock,
              imageBase64: item.product.specific_details.image_base64,
            }
          },
          quantity: item.quantity,
          size: item.size,
          total: item.total
        }));
  
        // Atualiza o modelo do carrinho
        this.cart = {
          id: response.cart_id, // Ajuste se necessário
          user: this.user as User,
          date: new Date(), // Ajuste conforme necessário
          items: this.cartItems, // Lista de itens já mapeada
          total: this.cartItems.reduce((sum, item) => sum + item.total, 0)
        };
  
        console.log('Cart:', this.cart);
        console.log('CartItems:', this.cartItems);
  
        // Calcula o total do carrinho
        this.calculateTotal();
      } else {
        console.error('Erro: Resposta do carrinho inválida.', response);
      }
    } catch (error) {
      console.error('Erro ao carregar o carrinho:', error);
    }
  }
  

  calculateTotal() {
    this.cartTotal = this.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  getImageSrc(imageBase64: string | null): string {
    if (!imageBase64) {
      return 'assets/images/default-product.png'; // Caminho para uma imagem padrão
    }
    return `data:image/jpeg;base64,${imageBase64}`; // Adicione o prefixo correto
  }
  

  async updateCartItem(item: any) {
  try {
    const userId = this.user?.id || 0; // Obtém o ID do usuário
    await this.cartService.updateCartItem(userId, item.id, { quantity: item.quantity }); // Chama o serviço
    this.calculateTotal(); // Recalcula o total do carrinho
  } catch (error) {
    console.error('Erro ao atualizar o item do carrinho:', error);
  }
}

  async removeCartItem(itemId: number) {
    try {
      await this.cartService.removeCartItem(this.user?.id || 0, itemId); // Passa o ID do usuário e do item
      this.cartItems = this.cartItems.filter(item => item.id !== itemId); // Remove o item do array local
      this.calculateTotal(); // Recalcula o total do carrinho
    } catch (error) {
      console.error('Erro ao remover o item do carrinho:', error);
    }
  }

  finalizarCompra() {
    this.router.navigate(['/payment-page']);
  }
}


