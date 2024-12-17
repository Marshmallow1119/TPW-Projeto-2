import { Component, OnInit, ChangeDetectorRef, Inject, Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../models/user';
import { ThemeButtonComponent } from '../theme-button/theme-button.component';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../balance-service.service';
import { ChatService } from '../chat.service';
import { ThemeService } from '../theme.service';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [ThemeButtonComponent, RouterModule, CommonModule, FormsModule],
})
export class NavbarComponent implements OnInit {
  searchQuery: string = '';
  user: User | null = null;
  selectedPaymentMethod: string | null = null;
  amount: number | null = null;
  balance: number = 0;
  isLoading: boolean | undefined;
  unreadMessagesCount: number = 0;
  dataLoaded: boolean = false;
  theme: string = 'default';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private balanceService: BalanceService,
    private chatService: ChatService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeService.theme$.subscribe((theme) => {
      console.log('NavbarComponent received theme:', theme);
      this.theme = theme;
    });
    this.authService.user$.subscribe((user) => {
      console.log('NavbarComponent received user:', user);
      this.user = user;
      console.log('User:', this.user);
      this.cdr.detectChanges();
  
      if (this.authService.isAuthenticated()) {
        Promise.all([this.loadBalance(), this.fetchUnreadMessagesCount()])
          .then(() => {
            console.log('All data loaded');
            this.dataLoaded = true; 
          })
          .catch((error) => {
            console.error('Error loading data:', error);
            this.dataLoaded = true; 
          });
      } else {
        this.dataLoaded = true;
      }
    });
      this.loadBalance();
  }
  fetchUnreadMessagesCount(): void {
    this.chatService.getUnreadMessagesCount().subscribe({
      next: (response: { unread_count: number; }) => {
        this.unreadMessagesCount = response.unread_count || 0; // Assuming the response has `unread_count`
      },
      error: (error) => {
        console.error('Failed to fetch unread messages count:', error);
      },
    });
    console.log(this.user);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onKeyUp(): void {
    if (this.searchQuery.trim().length > 0) {
      this.router.navigate(['/search-results'], {
        queryParams: { query: this.searchQuery },
      });
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim().length > 0) {
      this.router.navigate(['/search-results'], {
        queryParams: { query: this.searchQuery },
      });
    }
  }

  loadBalance(): void {
    this.balanceService.getBalance().then(
      (response) => {
        console.log('Balance fetched successfully:', response);
        if (this.user) {
          this.user.balance = response.balance; 
          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.error('Failed to fetch balance:', error);
      }
    );
  }

  
  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
    console.log('Selected Payment Method:', this.selectedPaymentMethod);
  }

  async addFunds(): Promise<void> {
    if (!this.selectedPaymentMethod || !this.amount || this.amount <= 0) {
      alert('Por favor, selecione um método e insira um valor válido.');
      return;
    }

    try {
      const response = await this.balanceService.addFunds(this.amount);
      console.log('Funds added successfully:', response);
      this.balance = response.new_balance; 
      alert('Saldo adicionado com sucesso!');
      const modalElement = document.getElementById('addFundsModal');
      if (modalElement) {
        modalElement.classList.remove('show');
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('style');
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        backdrop?.parentNode?.removeChild(backdrop);
      }
      this.resetModal();
      this.loadBalance();
    } catch (error) {
      console.error('Error adding funds:', error);
      alert('Erro ao adicionar saldo. Tente novamente.');
    }
  }
  
  resetModal(): void {
    this.selectedPaymentMethod = null;
    this.amount = null;
  }



  handleLogin(): void {
    localStorage.setItem('redirectUrl', this.router.url);
    this.router.navigate(['/login']);
  }
  
  


  changeTheme(theme: string): void {
    this.isLoading = true; 
  
    setTimeout(() => {
      this.themeService.changeTheme(theme); // Aplica o tema
      this.isLoading = false; 
    }, 1500);
  }
  


}