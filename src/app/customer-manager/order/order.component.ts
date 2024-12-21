import { NgFor, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderCard, ResponseDto } from '../../interfaces/customer';
import { OrderServiceService } from '../../services/order-service.service';
import { LoaderComponentComponent } from '../../loader-component/loader-component.component';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [NgFor, CommonModule, FormsModule, RouterModule, HttpClientModule,LoaderComponentComponent],
  providers: [OrderServiceService,LoaderComponentComponent],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orders: OrderCard[] = [];
  filteredOrders: OrderCard[] = [];
  searchTerm: string = '';
  selectedStatus: string = '1';
  selectedDateFilter: string = 'week';
  totalPrice: number = 0;
  loading: boolean = true;

  constructor(private orderService: OrderServiceService, private route: Router) { }

  searchOrder(){
    console.log(this.searchTerm);
    this.orderService.searchOrder(this.searchTerm).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.orders = response.responseObject;
          this.filteredOrders = this.orders;
        } else {
          alert(response.message);
        }
      },
    })
  }

  ngOnInit(): void {
    this.applyFilters();
    // this.orderService.getAllOrders().subscribe({
    //   next: (response: ResponseDto) => {
    //     if (response.isSuccess) {
    //       this.orders = response.responseObject;
    //       // this.orders = [
    //       //   {
    //       //     id: 1,
    //       //     branchname: 'Main',
    //       //     customer: 'John Doe',
    //       //     orderdate: '2022-12-01',
    //       //     deliverydate: '2022-12-20',
    //       //     ordertables: '3',
    //       //     totalPrice: 1000,
    //       //     orderstatus: 1
    //       //   },
    //       //   {
    //       //     id: 2,
    //       //     branchname: 'Main',
    //       //     customer: 'Jane Doe',
    //       //     orderdate: '2022-11-25',
    //       //     deliverydate: '2022-12-15',
    //       //     ordertables: '2',
    //       //     totalPrice: 500,
    //       //     orderstatus: 2
    //       //   },
    //       //   {
    //       //     id: 3,
    //       //     branchname: 'Main',
    //       //     customer: 'Bob Smith',
    //       //     orderdate: '2022-11-15',
    //       //     deliverydate: '2022-11-30',
    //       //     ordertables: '1',
    //       //     totalPrice: 100,
    //       //     orderstatus: 3
    //       //   }
    //       // ];
    //       this.applyFilters();
    //     } else {
    //       alert(response.message);
    //     }
    //   },
    //   error: (error) => {
    //     console.error(error);
    //   }
    // });
    
  }

  lastFilter:string = 'today';

  isOverdue(order: OrderCard): boolean {
    console.log("ordercolor")
    const today = new Date();
    const deliveryDate = new Date(order.deliverydate);
    const status = Number(order.orderstatus);
    return (status === 1 || status === 2) && deliveryDate < today;
  }

  applyFilters() {
    let filtered = this.orders;
    // Apply date filter
    if (this.selectedDateFilter !== this.lastFilter) {
      this.lastFilter = this.selectedDateFilter;
      const today = new Date();
      const startDate = new Date();
      this.loading = true;
      switch (this.selectedDateFilter) {
        case 'today':
          this.orderService.getFilterOrders({
            startDate: new Date(),
            endDate: new Date()
          }).subscribe({
            next: (response: ResponseDto) => {
              if (response.isSuccess) {
                this.orders = response.responseObject;
                this.filteredOrders = this.orders
                  .filter(order => order.orderstatus === parseInt(this.selectedStatus))
                  .sort((a, b) => new Date(b.orderdate).getTime() - new Date(a.orderdate).getTime());
                this.calculateTotalPrice();
                this.loading = false;
              } else {
                alert(response.message);
              }
            }
          })
          break;
        case 'week':
          this.orderService.getFilterOrders({
            startDate: new Date(today.setDate(today.getDate() - today.getDay())),
            endDate: new Date(today.setDate(today.getDate() - today.getDay() + 6))
          }).subscribe({
            next: (response: ResponseDto) => {
              if (response.isSuccess) {
                this.orders = response.responseObject;
                this.filteredOrders = this.orders
                  .filter(order => order.orderstatus === parseInt(this.selectedStatus))
                  .sort((a, b) => new Date(b.orderdate).getTime() - new Date(a.orderdate).getTime());
                this.calculateTotalPrice();
                this.loading = false;
              } else {
                alert(response.message);
              }
            }
          })
          break;
        case 'month':
          this.orderService.getFilterOrders({
            startDate: new Date(today.getFullYear(), today.getMonth(), 1),
            endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0)
          }).subscribe({
            next: (response: ResponseDto) => {
              if (response.isSuccess) {
                this.orders = response.responseObject;
                this.filteredOrders = this.orders
                  .filter(order => order.orderstatus === parseInt(this.selectedStatus))
                  .sort((a, b) => new Date(b.orderdate).getTime() - new Date(a.orderdate).getTime());
                this.calculateTotalPrice();
                this.loading = false;
              } else {
                alert(response.message);
              }
            }
          })
          break;
      }
      // filtered = filtered.filter(order => {
      //   const orderDate = new Date(order.orderdate);
      //   return orderDate >= startDate && orderDate <= today;
      // });
    }

    console.log(filtered,this.orders);
    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(order =>
        order.orderstatus === parseInt(this.selectedStatus)
      );
    }
    this.filteredOrders = filtered;
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    this.totalPrice = this.filteredOrders.reduce((sum, order) => sum + order.totalprice, 0);
  }

  goToOrder(id: number) {
    this.route.navigateByUrl("/customer-manager/order-info/" + id);
  }

  addOrder() {
    this.route.navigateByUrl("/customer-manager/add-order");
  }

  getStatusText(orderstatus: number): string {
    if (orderstatus == 1) {
      return 'Active';
    } else if (orderstatus == 2) {
      return 'Complete';
    } else {
      return 'Delivered';
    }
  }
}
