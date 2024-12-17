import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../products.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class EditProductComponent implements OnInit {
  productForm: FormGroup;
  initialProductType: string = 'vinil';
  productTypes = ['vinil', 'cd', 'clothing', 'accessory'];
  productId: number = 0;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private productService: ProductsService, 
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.productForm = this.fb.group({
      productType: [this.initialProductType, { disabled: true }],
      artist: [{ value: '', disabled: true }],
      name: [''],
      description: [''],
      price: [''],
      image: [''],
      vinil: this.fb.group({
        genre: [''],
        lpSize: [''],
        releaseDate: [''],
        stock: [0]
      }),
      cd: this.fb.group({
        genre: [''],
        releaseDate: [''],
        stock: [0]
      }),
      clothing: this.fb.group({
        color: ['']
      }),
      accessory: this.fb.group({
        material: [''],
        color: [''],
        stock: [0]
      })
    });
  }

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('product_id'));
    console.log('Product ID:', this.productId);
    this.productService.getProduct(this.productId).then(product => {
      console.log('Full Product:', product);
      
      this.initialProductType = product.product_type?.toLowerCase() ?? 'vinil';
      this.updateFieldVisibility(this.initialProductType);
  
      this.productForm.patchValue({
        productType: this.initialProductType,
        artist: product.artist?.name || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
      });

      if (product.image_url) {
        this.imagePreview = product.image_url; 
      }
  
      const specificDetails = product.specific_details;
  
      if (specificDetails) {
        switch (this.initialProductType) {
          case 'vinil':
            this.productForm.get('vinil')?.patchValue({
              genre: specificDetails.genre || '',
              lpSize: specificDetails.lpSize || '',
              releaseDate: specificDetails.releaseDate || '',
              stock: specificDetails.stock || 0
            });
            break;
  
          case 'cd':
            this.productForm.get('cd')?.patchValue({
              genre: specificDetails.genre || '',
              releaseDate: specificDetails.releaseDate || '',
              stock: specificDetails.stock || 0
            });
            break;
  
          case 'clothing':
            this.productForm.get('clothing')?.patchValue({
              color: specificDetails.color || ''
            });
            break;
  
          case 'accessory':
            this.productForm.get('accessory')?.patchValue({
              material: specificDetails.material || '',
              color: specificDetails.color || '',
              stock: specificDetails.stock || 0
            });
            break;
        }
      } else {
        console.warn('No specific_details available');
      }
    });
  }
  

  updateFieldVisibility(productType: string): void {
    const controls = ['vinil', 'cd', 'clothing', 'accessory'];
    controls.forEach(control => {
      const group = this.productForm.get(control);
      if (group) {
        if (control === productType) {
          group.enable();  
        } else {
          group.disable({ emitEvent: false }); 
        }
      }
    });
  }
  
  
  onProductTypeChange(event: Event): void {
    const selectedType = (event.target as HTMLSelectElement).value;
    this.updateFieldVisibility(selectedType);
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }

      this.productForm.patchValue({ image: file });
      this.productForm.get('image')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = new FormData();
  
      formData.append('productType', this.productForm.get('productType')?.value);
      formData.append('artist', this.productForm.get('artist')?.value);
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);
  
      const productType = this.productForm.get('productType')?.value;
      const specificDetails = this.productForm.get(productType)?.value; 
      if (specificDetails) {
        formData.append('specific_details', JSON.stringify(specificDetails));
        console.log('Specific Details:', specificDetails);
      }
  
      const image = this.productForm.get('image')?.value;
      if (image) {
        formData.append('image', image);
      }
  
      this.productService.editProduct(formData, this.productId).then(response => {
        console.log('Product updated successfully:', response);
        alert('Produto atualizado com sucesso!');
        this.location.back();
      }).catch(error => {
        console.error('Error updating product:', error);
        alert('Error updating product.');
      });
    } else {
      alert('Form is invalid. Please check all required fields.');
    }
  }

  
  
}
