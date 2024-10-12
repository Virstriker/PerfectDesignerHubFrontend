import { NgFor, CommonModule, DatePipe, formatPercent } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderServiceService } from '../../services/order-service.service';
import { OrderCard, ResponseDto } from '../../interfaces/customer';

@Component({
  selector: 'app-order-notification',
  standalone: true,
  imports: [NgFor,CommonModule,FormsModule,RouterModule,HttpClientModule],
  providers:[OrderServiceService,DatePipe],
  templateUrl: './order-notification.component.html',
  styleUrl: './order-notification.component.css'
})
export class OrderNotificationComponent implements OnInit{
  filter = {
    isDeliveryDate: true,
    isComplete: false,
    fromDate: '',
    toDate: ''
  };
  orders:OrderCard [] = [];
  constructor(private orderService: OrderServiceService,
    private router: Router,
  private datePipe: DatePipe) { }
  
  showFilters = false;

  toggleFilterVisibility() {
    this.showFilters = !this.showFilters;
  }

  applyQuickFilter(period: string) {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfNextWeek = new Date(startOfWeek);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    switch (period) {
      case 'thisWeek':
        this.filter.fromDate = startOfWeek.toISOString().split('T')[0];
        this.filter.toDate = startOfNextWeek.toISOString().split('T')[0];
        break;
      case 'nextWeek':
        this.filter.fromDate = startOfNextWeek.toISOString().split('T')[0];
        this.filter.toDate = new Date(startOfNextWeek.setDate(startOfNextWeek.getDate() + 7)).toISOString().split('T')[0];
        break;
      case 'thisMonth':
        this.filter.fromDate = startOfMonth.toISOString().split('T')[0];
        this.filter.toDate = startOfNextMonth.toISOString().split('T')[0];
        break;
      case 'nextMonth':
        this.filter.fromDate = startOfNextMonth.toISOString().split('T')[0];
        this.filter.toDate = new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString().split('T')[0];
        break;
    }

    this.applyFilter();
  }
  formatDate(dateStr: string): string | null {
    // Parse the string into a JavaScript Date object
    const dateObj = new Date(dateStr);
  
    // Format the date using Angular's DatePipe
    return this.datePipe.transform(dateObj, 'yyyy-MM-dd');
  }
  ngOnInit(): void {
    const formattedDate = this.formatDate(new Date().toDateString());
    if (formattedDate !== null) {
      this.filter.fromDate = formattedDate;
      this.filter.toDate = formattedDate;
    } else {
      // Handle the case where formatDate returns null
      console.error('Failed to format date');
      // You might want to set a default date or show an error message
    }
    this.orderService.getFilterOrders(this.filter).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.orders = response.responseObject;
          console.log(this.orders)
        } else {
          alert(response.message);
        }
      }
    });
  }
  applyFilter() {
    // Here you would call a method from your OrderServiceService
    // to fetch filtered orders based on the filter criteria
    this.orderService.getFilterOrders(this.filter).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.orders = response.responseObject;
          console.log(this.orders)
        } else {
          alert(response.message);
        }
      }
    });
  }
  goToOrder(id:number){
    this.router.navigateByUrl("/customer-manager/order-info/"+id);
  }
}
