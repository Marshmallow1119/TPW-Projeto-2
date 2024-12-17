import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service'; 
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;

  formFields = [
    { name: 'first_name', label: 'Primeiro Nome', type: 'text', error: 'First name is required.' },
    { name: 'last_name', label: 'Último Nome', type: 'text', error: 'Last name is required.' },
    { name: 'username', label: 'Username', type: 'text', error: 'Username is required.' },
    { name: 'email', label: 'Email', type: 'email', error: 'Valid email is required.' },
    { name: 'address', label: 'Morada', type: 'text', error: '' },
    { name: 'phone', label: 'Telemóvel', type: 'text', error: 'Enter a valid phone number.' },
    { name: 'country', label: 'País', type: 'text', error: 'Country is required.' },
    { name: 'password1', label: 'Password', type: 'password', error: 'Password is required.' },
    { name: 'password2', label: 'Confirme a Password', type: 'password', error: 'Confirm your password.' },
    { name: 'image', label: 'Foto de Perfil', type: 'file', error: '' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      phone: ['', [Validators.pattern('^[9|2][0-9]{8}$')]],
      country: ['', [Validators.required]],
      password1: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', [Validators.required]],
      image: [null],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill out all required fields correctly.';
      return;
    }

    const formData = new FormData();

    Object.entries(this.registerForm.value).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append(key, value); 
      } else if (value !== null) {
        formData.append(key, value as string);
      }
    });

    this.authService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.error.errors) {
          this.setFieldErrors(err.error.errors);
        } else {
          this.errorMessage = err.error.message || 'Registration failed. Try again.';
        }
      },
    });
  }

  private setFieldErrors(errors: { [key: string]: string[] }): void {
    Object.keys(errors).forEach((field) => {
      const control = this.registerForm.get(field);
      if (control) {
        control.setErrors({ serverError: errors[field][0] });
      }
    });
  }


  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.registerForm.get('image')?.setValue(input.files[0]);
    }
  }
  
}
  
