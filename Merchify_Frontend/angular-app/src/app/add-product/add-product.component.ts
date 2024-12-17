import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../products.service';
import { Router } from '@angular/router';
import { ArtistsService } from '../artists.service';
import { Artist } from '../models/artista';
import { CompaniesService } from '../companhia.service';
import { AuthService } from '../auth.service';

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
  companies: any[] = [];
  imagePreview: string | null = null;
  isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductsService,
    private router: Router,
    private artistsService: ArtistsService,
    private companiesService: CompaniesService,
    private authService: AuthService
  ) {
    this.productForm = this.fb.group({
      productType: ['vinil', Validators.required],
      artist: ['', Validators.required],
      company: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      image: [null, Validators.required],
      vinil: this.fb.group({
        genre: ['', ],
        lpSize: ['', ],
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
    // Fetch artists
    this.artistsService.getArtistas()
      .then(artists => {
        this.artists = artists;
      })
      .catch(error => {
        console.error('Error fetching artists:', error);
      });

    // Fetch user info and conditionally load companies
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.isAdmin = user?.user_type === 'admin';
        console.log('isAdmin:', this.isAdmin);

        // Fetch companies only if the user is admin
        if (this.isAdmin) {
          this.loadCompanies();
        }
      },
      error: (err) => {
        console.error('Error fetching user info:', err);
      }
    });
  }

  // Separate method to fetch companies
  private loadCompanies(): void {
    this.companiesService.getCompanies()
      .then(companies => {
        this.companies = companies;
      })
      .catch(error => {
        console.error('Error fetching companies:', error);
      });
  }

  updateFieldVisibility(productType: string): void {
    const controls = ['vinil', 'cd', 'clothing', 'accessory'];
    controls.forEach(control => {
      const group = this.productForm.get(control);
      if (group) {
        if (control === productType) {
          group.enable(); // Enable the selected group
        } else {
          group.reset(); // Reset the group to empty values
          group.disable(); // Disable other groups
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
      formData.append('productType', this.productForm.value.productType);
      formData.append('artist', this.productForm.value.artist);
      formData.append('name', this.productForm.value.name);
      formData.append('description', this.productForm.value.description);
      formData.append('price', this.productForm.value.price);
  
      const productType = this.productForm.value.productType;
      const specificDetails = this.productForm.get(productType)?.value || {};
      formData.append('specific_details', JSON.stringify(specificDetails));
  
      if (this.productForm.value.image) {
        formData.append('image', this.productForm.value.image);
      }
  
      if (this.productForm.value.company) {
        formData.append('company', this.productForm.value.company);
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
      this.debugFormErrors(this.productForm); // Call the debug method
      this.productForm.markAllAsTouched();
    }
  }
  private debugFormErrors(group: FormGroup | any, path: string = ''): void {
    Object.keys(group.controls).forEach((key) => {
      const control = group.get(key);
      const currentPath = path ? `${path}.${key}` : key;
  
      if (control instanceof FormGroup) {
        this.debugFormErrors(control, currentPath); // Recursively debug nested form groups
      } else if (control?.invalid) {
        console.error(`Invalid Field: ${currentPath}`, {
          value: control.value,
          errors: control.errors
        });
      }
    });
  }

}
  