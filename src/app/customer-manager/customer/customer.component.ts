import { CommonModule, NgFor } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer, CustomerAdd, ResponseDto} from "../../interfaces/customer";
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CustomerServiceService } from '../../services/customer-service.service';


@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [NgFor,CommonModule,FormsModule,RouterModule,HttpClientModule],
  providers: [CustomerServiceService],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  addCustomerVariable:CustomerAdd={
    Id:null,
    Name:'',
    Surname:'',
    Phonenumber:'',
    Address:''
  }
  

  errors: any = {};
  showModal = false;
  searchTerm: string = '';

  constructor(private router: Router,private customerService:CustomerServiceService) {}

  ngOnInit() {
    this.getAllCustomers();
  }

  getAllCustomers() {
    this.customerService.getAllCustomer().subscribe({
      next: (response: ResponseDto) => {
        this.customers = response.responseObject;
        this.filteredCustomers = this.customers;
        console.log('Customers loaded:', this.customers);
      },
      error: (error) => {
        console.error('Error fetching customers:', error);
      }
    });
  }

  addCustomer():any{
    this.customerService.addCustomer(this.addCustomerVariable).subscribe({
      next: (response: ResponseDto) => {
        if(response.isSuccess){
          this.getAllCustomers();
          alert("customer added");
        }else{
          alert(response.message);
        }
      }
    });
  }

  onSearchEmpty(){
    if(this.searchTerm === ''){
      this.getAllCustomers();
    }
  }

  searchCustomer(){
    if(this.searchTerm === ''){
      alert("Enter name");
    }else{
      this.customerService.searchCustomer(this.searchTerm).subscribe({
        next: (response:ResponseDto) =>{
          if(response.isSuccess){
            this.filteredCustomers = response.responseObject;
          }else{
            alert("No customer found");
          }
        }
      });
    }
  }

  goToCustomerInfo(customerId:number){
    this.router.navigateByUrl('customer-manager/customer-info/'+customerId);
  }

  toggleModal() {
    this.showModal = !this.showModal;
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
      this.toggleModal();
    }
  }
}
