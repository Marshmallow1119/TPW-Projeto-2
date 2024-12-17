import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CompaniesService } from '../companhia.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class AddCompanyComponent implements OnInit {
  addCompanyForm: FormGroup;
  messages: { type: string; text: string }[] = [];

  companyControls = [
    { key: 'name', label: 'Nome da Empresa', type: 'text' },
    { key: 'address', label: 'Morada', type: 'text' },
    { key: 'phone', label: 'Telefone', type: 'text' },
    { key: 'logo', label: 'Logo da Empresa', type: 'file' },
  ];

  userControls = [
    { key: 'username', label: 'Nome de Usuário', type: 'text' },
    { key: 'password', label: 'Senha', type: 'password' },
    { key: 'email', label: 'Email do Usuário', type: 'email' },
    { key: 'password2', label: 'Confirme a Senha', type: 'password' },
  ];
  constructor(private fb: FormBuilder, private companyService: CompaniesService, private router: Router) {
    this.addCompanyForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.companyControls.forEach((control) =>
      this.addCompanyForm.addControl(
        control.key,
        control.type === 'file'
          ? this.fb.control(null)
          : this.fb.control('', Validators.required)
      )
    );

    this.userControls.forEach((control) =>
      this.addCompanyForm.addControl(
        control.key,
        this.fb.control('', Validators.required)
      )
    );
  }

  isInvalid(controlName: string): boolean {
    const control = this.addCompanyForm.get(controlName);
    return control!.invalid && (control!.dirty || control!.touched);
  }

  getError(controlName: string): string {
    const control = this.addCompanyForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo é obrigatório.';
    }
    return '';
  }

  async onSubmit(): Promise<void> {
    if (this.addCompanyForm.invalid) {
      this.messages = [{ type: 'danger', text: 'Por favor, corrija os erros no formulário.' }];
      return;
    }

    if (this.addCompanyForm.get('password')?.value !== this.addCompanyForm.get('password2')?.value) {
      this.messages = [{ type: 'danger', text: 'As senhas não coincidem.' }];
      return;
    }
  
    const formData = new FormData();
  
    Object.keys(this.addCompanyForm.controls).forEach((key) => {
      const control = this.addCompanyForm.get(key);
  
      if (key === 'logo') {
        const fileInput = control?.value;
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          formData.append(key, fileInput.files[0]); 
        }
      } else {
        formData.append(key, control?.value || ''); 
      }
    });
  
    try {
      const response = await this.companyService.addCompany(formData); 
      this.messages = [{ type: 'success', text: response.message }];
      this.router.navigate(['/admin-home']);
    } catch (error) {
      this.messages = [{ type: 'danger', text: 'Falha ao adicionar a empresa. Verifique os detalhes.' }];
      console.error('Error:', error);
    }
  }
  
}
