import { Component, OnInit } from '@angular/core';
import { CustomerDetail, OrderCard } from '../../interfaces/customer';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-customer-info',
  standalone: true,
  imports: [FormsModule,NgClass,NgFor],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.css'
})
export class CustomerInfoComponent implements OnInit {
  customer: CustomerDetail = {
    name: 'John',
    surname: 'Doe',
    phoneNumber: '+1 123-456-7890',
    address: '123 Main St, Anytown, USA'
  };

  customerOrders: OrderCard[] = [
    {
      orderNumber: 1001,
      status: 'Pending',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-06-10')
    },
    {
      orderNumber: 1002,
      status: 'Processing',
      startDate: new Date('2023-06-05'),
      endDate: new Date('2023-06-15')
    },
    {
      orderNumber: 1003,
      status: 'Completed',
      startDate: new Date('2023-05-20'),
      endDate: new Date('2023-05-30')
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize component data if needed
  }

  seeMeasurement(): void {
    // Implement logic to show measurement details
    console.log('Showing measurement details');
  }

  goBack() {
    // Implement the logic to go back, e.g., navigating to the previous page
    window.history.back();
  }
}
