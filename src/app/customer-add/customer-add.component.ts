import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerAdd, ResponseDto } from '../interfaces/customer';
import { CustomerServiceService } from '../services/customer-service.service';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customer-add',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule],
  providers: [CustomerServiceService],
  templateUrl: './customer-add.component.html',
  styleUrl: './customer-add.component.css'
})
export class CustomerAddComponent {
  addCustomerVariable: CustomerAdd = {
    Id: null,
    Name: '',
    Surname: '',
    Phonenumber: '',
    Address: ''
  };

  errors: any = {};

  constructor(
    private router: Router,
    private customerService: CustomerServiceService
  ) {}

  addCustomer(): any {
    this.customerService.addCustomer(this.addCustomerVariable).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Customer added successfully',
            background: '#f0fff0',
            confirmButtonColor: '#28a745'
          });
          this.addCustomerVariable = {
            Id: null,
            Name: '',
            Surname: '',
            Phonenumber: '',
            Address: ''
          };
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: "Customer Alredy Exists",
            background: '#fff0f0',
            confirmButtonColor: '#dc3545'
          });
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: "Customer Alredy Exists",
          background: '#fff0f0',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  validateForm() {
    const newErrors: any = {};

    if (!this.addCustomerVariable.Name.trim()) newErrors.firstName = 'First name is required';
    if (!this.addCustomerVariable.Surname.trim()) newErrors.lastName = 'Last name is required';
    if (!this.addCustomerVariable.Phonenumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d+$/.test(this.addCustomerVariable.Phonenumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    if (!this.addCustomerVariable.Address.trim()) newErrors.address = 'Address is required';

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  onSubmit() {
    if (this.validateForm()) {
      this.addCustomer();
    }
  }

  goBack() {
    this.router.navigate(['/customer-manager/customer']);
  }
}