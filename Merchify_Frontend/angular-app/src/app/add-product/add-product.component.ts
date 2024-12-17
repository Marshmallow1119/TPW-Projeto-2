import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../products.service';
import { Router } from '@angular/router';
import { ArtistsService } from '../artists.service';
import { Artist } from '../models/artista';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  productTypes = ['vinil', 'cd', 'clothing', 'accessory'];
  artists: Artist[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductsService,
    private router: Router,
    private artistsService: ArtistsService
  ) {
    this.productForm = this.fb.group({
      productType: ['vinil', Validators.required],
      artist: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      image: [null, Validators.required],
      vinil: this.fb.group({
        genre: ['', Validators.required],
        lpSize: ['', Validators.required],
        releaseDate: ['', Validators.required],
        stock: [0, Validators.required]
      }),
      cd: this.fb.group({
        genre: ['', Validators.required],
        releaseDate: ['', Validators.required],
        stock: [0, Validators.required]
      }),
      clothing: this.fb.group({
        color: ['', Validators.required]
      }),
      accessory: this.fb.group({
        material: ['', Validators.required],
        color: ['', Validators.required],
        stock: [0, Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.artistsService.getArtistas().then(artists => {
      this.artists = artists;
    }).catch(error => {
      console.error('Error fetching artists:', error);
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
          group.disable();
          group.reset();
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
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = new FormData();
      formData.append('productType', this.productForm.value.productType);
      formData.append('artist', this.productForm.value.artist);
      formData.append('name', this.productForm.value.name);
      formData.append('description', this.productForm.value.description);
      formData.append('price', this.productForm.value.price);

      const productType = this.productForm.value.productType;
      const specificDetails = this.productForm.value[productType];
      if (specificDetails) {
        formData.append('specific_details', JSON.stringify(specificDetails));
      }

      if (this.productForm.value.image) {
        formData.append('image', this.productForm.value.image);
      }

      this.productService.addProduct(formData).then(response => {
        console.log('Product added successfully:', response);
        alert('Product added successfully!');
        this.router.navigate(['/products']);
      }).catch(error => {
        console.error('Error adding product:', error);
        alert('Failed to add product.');
      });
    } else {
      alert('Please fill out all required fields.');
      this.productForm.markAllAsTouched(); 
    }
  }
}
