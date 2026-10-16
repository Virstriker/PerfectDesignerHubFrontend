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
  imports: [NgFor, CommonModule, FormsModule, RouterModule, HttpClientModule, LoaderComponentComponent],
  providers: [OrderServiceService, LoaderComponentComponent],
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
  lastFilter: string = 'today';

  constructor(private orderService: OrderServiceService, private route: Router) { }

  ngOnInit(): void {
    this.applyFilters();
  }

  searchOrder() {
    console.log(this.searchTerm);
    if (!this.searchTerm.trim()) {
      this.applyFilters();
      return;
    }
    this.loading = true;
    this.orderService.searchOrder(this.searchTerm).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.orders = response.responseObject;
          this.filteredOrders = this.orders;
          this.calculateTotalPrice();
        } else {
          alert(response.message);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
  }

  onSearchInput() {
    if (!this.searchTerm.trim()) {
      this.applyFilters();
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  isOverdue(order: OrderCard): boolean {
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
                this.loading = false;
              }
            },
            error: () => { this.loading = false; }
          });
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
                this.loading = false;
              }
            },
            error: () => { this.loading = false; }
          });
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
                this.loading = false;
              }
            },
            error: () => { this.loading = false; }
          });
          break;
      }
    }

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
    this.totalPrice = this.filteredOrders.reduce((sum, order) => sum + (order.totalprice || 0), 0);
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

  getStatusClass(orderstatus: number): string {
    if (orderstatus == 1) {
      return 's-active';
    } else if (orderstatus == 2) {
      return 's-complete';
    } else {
      return 's-delivered';
    }
  }
}
