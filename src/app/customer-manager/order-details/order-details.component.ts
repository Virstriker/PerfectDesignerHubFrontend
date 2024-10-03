import { Component, OnInit } from '@angular/core';
import { OrderCard, OrderDetails, ResponseDto } from '../../interfaces/customer';
import { OrderServiceService } from '../../services/order-service.service';
import { CommonModule, NgFor } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [NgFor, CommonModule, FormsModule, RouterModule, HttpClientModule],
  providers: [OrderServiceService],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit {
  order: OrderDetails = {
    orderDto: {
      branchname: '',
      customer: '',
      deliverydate: '',
      id: 0,
      orderdate: '',
      orderstatus: false,
      ordertables: '',
      totalPrice: 0,
    },
    blouses: [],
    dresses: [],
    chaniyo: [],
    pants: []
  };
  orderId!: number;
  constructor(private orderService: OrderServiceService,
    private route: ActivatedRoute
  ) { } // Assume OrderService is a service to fetch data

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id']; // Convert string to number using '+'
      // Use this.customerId to fetch customer details
    });
    this.orderService.getOrderDetailsById(this.orderId).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.order = response.responseObject;
          console.log(this.order)
        } else {
          alert(response.message);
        }
      }
    });
  }
  generateBillPdf() {
    this.orderService.getBillPdf(this.order).subscribe({
      next: (response:any)=>{
        // Create a blob object from the PDF data
      const blob = new Blob([response], { type: 'application/pdf' });
      
      // Create a temporary link element
      const link = document.createElement('a');
      
      // Set the download attribute with the file name
      link.href = window.URL.createObjectURL(blob);
      link.download = `${this.order.orderDto.customer}.pdf`;
      
      // Append the link to the body temporarily and trigger click to download
      document.body.appendChild(link);
      link.click();
      
      // Clean up the link after triggering the download
      document.body.removeChild(link);

      }
    });
  }
}
