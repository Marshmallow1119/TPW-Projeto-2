import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../models/produto';
import { ProductsService } from '../products.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CONFIG } from '../config';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css'],
})
export class EditProductComponent implements OnInit {
  editForm: FormGroup;
  productId: number;
  companyId: number;
  product: Product | null = null;
  baseUrl: string = CONFIG.baseUrl;

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      product_type: ['', Validators.required],
      image: [null], // Campo para o arquivo (File)
    });
    

    this.productId = 0;
    this.companyId = 0;
  }

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('product_id'));
    this.companyId = Number(this.route.snapshot.paramMap.get('company_id'));
    this.loadProduct(this.productId);
    console.log('Product loaded:', this.product);
  }


  async loadProduct(productId: number): Promise<void> {

    try {
      this.product = await this.productsService.getProduct(productId);
      if (this.product) {
        this.editForm.patchValue({
          name: this.product.name,
          description: this.product.description,
          price: this.product.price,
          product_type: this.product.product_type,
        });
      }
    }
    catch (error) {
      console.error('Erro ao carregar o produto:', error);
    }
  }
  

  async onSubmit(): Promise<void> {
    if (this.editForm.valid) {
      const formData = new FormData();
      formData.append('name', this.editForm.value.name);
      formData.append('description', this.editForm.value.description);
      formData.append('price', this.editForm.value.price);
      formData.append('product_type', this.editForm.value.product_type);

      if (this.editForm.value.image) {
        formData.append('image', this.editForm.value.image); // Arquivo selecionado
      }
      try {
        const response = await fetch(`${this.baseUrl}/product/${this.productId}/`, {
          method: 'PUT',
          body: formData,
        });
      
        const responseBody = await response.text(); // Captura o corpo da resposta
        console.log('Resposta do servidor:', responseBody); // Mostra a resposta no console
      
        if (!response.ok) {
          throw new Error(`Erro ao atualizar o produto: ${response.statusText}`);
        }
      
        alert('Produto atualizado com sucesso!');
        this.router.navigate(['/companies', this.companyId, 'products']);
      } catch (error) {
        console.error('Erro ao atualizar o produto:', error);
        alert('Houve um problema ao atualizar o produto. Verifica o console para mais detalhes.');
      }
      
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  }
  
  

  onCancel(): void {
    this.router.navigate(['/companies', this.companyId, 'products']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0]; // Primeiro arquivo selecionado
      this.editForm.patchValue({
        image: file, // Atualiza o valor do campo 'image'
      });
      this.editForm.get('image')?.updateValueAndValidity(); // Validação
    }
  }
  
}
