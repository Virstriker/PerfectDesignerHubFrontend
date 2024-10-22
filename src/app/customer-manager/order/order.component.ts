import { NgFor, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderCard, ResponseDto } from '../../interfaces/customer';
import { OrderServiceService } from '../../services/order-service.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [NgFor,CommonModule,FormsModule,RouterModule,HttpClientModule],
  providers:[OrderServiceService],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit{
  searchTerm: string = '';
  orders:OrderCard [] = [];
  constructor(private orderService:OrderServiceService,
    private route:Router
  ){}
  ngOnInit(): void {
    this.orderService.getAllOrders().subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.orders = response.responseObject.sort((a: OrderCard, b: OrderCard) => b.id - a.id);
          console.log(this.orders);
        } else {
          alert(response.message);
        }
      }
    });
  }
  goToOrder(id:number){
    this.route.navigateByUrl("/customer-manager/order-info/"+id);
  }
  addOrder(){
    this.route.navigateByUrl("/customer-manager/add-order");
  }
}
