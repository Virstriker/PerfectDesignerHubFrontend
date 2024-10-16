import { Component, OnInit } from '@angular/core';
import { OrderCard, OrderDetails, ResponseDto } from '../../interfaces/customer';
import { OrderServiceService } from '../../services/order-service.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
interface Item {
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface InvoiceData {
  name: string;
  date: Date;
  id: number;
  items: Item[];
  tax: number;
  grandTotal: number;
}
@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [NgFor,NgIf, CommonModule, FormsModule, RouterModule, HttpClientModule],
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
  completeOrder(){
    this.orderService.completeOrder(this.orderId).subscribe({
      next:  (response: ResponseDto) => {
        if(response.isSuccess){
          alert("Order Completed");
        }
      }
    })
  }
  generateBillPdf() {
    const data:InvoiceData = {
      name: this.order.orderDto.customer,
      date: new Date(),
      id: this.order.orderDto.id,
      items: [],
      tax: 0,
      grandTotal: 0
    };
    for(var blouse of this.order.blouses){
      const item:Item = {
        name:'Blouse',
        price:blouse.price,
        quantity:1,
        totalPrice:blouse.price
      }
      data.grandTotal +=  item.totalPrice;
      data.items.push(item);
    }
    for(var pant of this.order.pants){
      const item:Item = {
        name:'Pant',
        price:pant.price,
        quantity:1,
        totalPrice:pant.price
      }
      data.grandTotal +=  item.totalPrice;
      data.items.push(item);
    }
    for(var chaniy of this.order.chaniyo){
      const item:Item = {
        name:'Chaniyo',
        price:chaniy.price,
        quantity:1,
        totalPrice:chaniy.price
      }
      data.grandTotal +=  item.totalPrice;
      data.items.push(item);
    }
    for(var dress of this.order.dresses){
      const item:Item = {
        name:'Dress',
        price:dress.price,
        quantity:1,
        totalPrice:dress.price
      }
      data.grandTotal +=  item.totalPrice;
      data.items.push(item);
    }
    data.grandTotal -= data.tax;
    this.orderService.generatePdf(data);
   
  }
  goBack() {
    // Implement the logic to go back, e.g., navigating to the previous page
    window.history.back();
  }
}
