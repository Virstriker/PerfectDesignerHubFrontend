import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer} from "../../interfaces/customer";
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [NgFor,CommonModule,FormsModule,RouterModule],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent implements OnInit {
  constructor(private router: Router) {}
  customers: Customer[] = [
    { id: 1, name: 'John Doe', number: 'CUS001' },
    { id: 2, name: 'Jane Smith', number: 'CUS002' },
    { id: 3, name: 'Bob Johnson', number: 'CUS003' },
    { id: 4, name: 'Alice Brown', number: 'CUS004' },
    { id: 5, name: 'Charlie Davis', number: 'CUS005' }
  ];

  filteredCustomers: Customer[] = [];
  searchTerm: string = '';

  ngOnInit() {
    this.filteredCustomers = this.customers;
  }
  
  openAddCustomerModal() {
    // Implement the logic to open a modal or navigate to add customer form
    console.log('Open add customer modal');
  }

  ngDoCheck() {
    this.filterCustomers();
  }

  goToCustomerInfo(customerId:number){
    this.router.navigateByUrl('customer-manager/customer-info/'+customerId);
  }

  filterCustomers() {
    if (!this.searchTerm) {
      this.filteredCustomers = this.customers;
    } else {
      this.filteredCustomers = this.customers.filter(customer =>
        customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.number.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
}
