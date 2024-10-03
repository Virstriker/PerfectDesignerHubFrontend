import { NgFor, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomerServiceService } from '../../services/customer-service.service';
import { Customer, CustomerAdd, ResponseDto } from '../../interfaces/customer';

@Component({
  selector: 'app-measurement',
  standalone: true,
  imports: [NgFor,CommonModule,FormsModule,RouterModule,HttpClientModule],
  providers: [CustomerServiceService],
  templateUrl: './measurement.component.html',
  styleUrl: './measurement.component.css'
})
export class MeasurementComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];

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
  goToMeasurment(id:any){
    this.router.navigateByUrl('customer-manager/measurement-detail/'+id);
  }
}
