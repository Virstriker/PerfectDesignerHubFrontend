import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CustomerServiceService } from '../../services/customer-service.service';
import { Router } from '@angular/router';
import { ResponseDto } from '../../interfaces/customer';
import { DailyOrderServiceService } from '../../services/daily-order-service.service';

// Define the Order interface
interface Order {
  id: number;
  customerName: string;
  customerId: number;
  orderDetail: string;
  deliveryDate: Date;
  orderDate: Date;
  orderAmount: number;
  orderState: number;
}

// Add Customer interface
interface Customer {
  id: number;
  name: string;
}

enum OrderStatus {
  Active = 1,
  Complete = 2,
  Delivered = 3
}

interface OrderItem {
  name: string;
  quantity: number;
}

@Component({
  selector: 'app-daily-order',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [CustomerServiceService, DatePipe, DailyOrderServiceService],
  templateUrl: './daily-order.component.html',
  styleUrl: './daily-order.component.css'
})
export class DailyOrderComponent implements OnInit {
  // Class properties/constants
  orders: Array<Order> = new Array<Order>();
  customerIds: any[] = [];
  totalAmount: number = 0;
  selectedStatus = 1;
  isModalOpen = false;
  orderItems: OrderItem[] = [{ name: '', quantity: 1 }];
  newOrder = {
    customerId: 0,
    orderDetail: '',
    deliveryDate: new Date(),
    orderAmount: 0,
    orderState: 1
  };
  isAmountModalOpen: boolean = false;
  updateAmount: number = 0;
  selectedOrder: any = null;
  currentDate: Date = new Date();
  filter = {
    fromDate: '',
    toDate: ''
  };
  selectedDateFilter: string = 'all'; // Default to 'all'
  customerSearchTerm: string = '';
  filteredCustomerIds: any[] = [];

  @ViewChild('searchInput') searchInput!: ElementRef;

  isDropdownOpen = false;

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.searchInput.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.customerSearchTerm = '';
      this.filterCustomers();
    }
  }

  // Constructor
  constructor(
    private customerService: CustomerServiceService,
    private rout: Router,
    private datePipe: DatePipe,
    private dailyOrderService: DailyOrderServiceService,
    private elementRef: ElementRef
  ) { }

  // Lifecycle methods
  ngOnInit() {
    this.currentDate = new Date();
    this.customerService.getAllCustomer().subscribe({
      next: (response: ResponseDto) => {
        this.customerIds = response.responseObject.sort((a: Customer, b: Customer) =>
          a.name.localeCompare(b.name)
        );
        this.filteredCustomerIds = this.customerIds;
      }
    });
    this.dailyOrderService.getDailyOrders().subscribe({
      next: (respons: ResponseDto) => {
        this.orders = respons.responseObject;
      }
    });
  }

  // Getters
  get filteredOrders(): Order[] {
    var filter = this.orders.filter(order => order.orderState === this.selectedStatus);
    if(this.selectedDateFilter === 'today' && this.selectedStatus===3){
      filter = this.orders.filter(order => 
        order.orderState === this.selectedStatus && 
        new Date(order.deliveryDate).toDateString() === this.currentDate.toDateString()
      );
    }
    this.totalAmount = filter.reduce((sum, order) => sum + order.orderAmount, 0);
    return filter;
  }

  // Public methods
  filterByStatus(status: any): void {
    this.selectedStatus = status;
  }

  addNewOrder(): void {
    this.isModalOpen = true;
    this.orderItems = [{ name: '', quantity: 1 }];
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }
  isPastOrder(orderDate: Date): boolean {
    return new Date(orderDate) < this.currentDate;
  }
  submitOrder(): void {
    if (!this.newOrder.customerId || !this.newOrder.orderAmount) {
      alert('Please fill in all required fields');
      return;
    }

    this.newOrder.orderDetail = this.orderItems
      .map(item => `${item.name}:${item.quantity}`)
      .join('|');

    this.dailyOrderService.addDailyOrder(this.newOrder).subscribe({
      next: (response: ResponseDto) => {
        alert(response.message);
        this.loadOrders();
      },
      error: (error) => {
        alert('Error adding order: ' + error.message);
      }
    });
    this.closeModal();
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Active: return 'Active';
      case OrderStatus.Complete: return 'Complete';
      case OrderStatus.Delivered: return 'Delivered';
      default: return '';
    }
  }

  updateDailyOrderState(order: any) {
    if (order.orderState != 3) {
      this.selectedOrder = order;
      this.updateAmount = order.orderAmount;
      this.isAmountModalOpen = true;
    }
  }

  addItem() {
    this.orderItems.push({ name: '', quantity: 1 });
  }

  removeItem(index: number) {
    this.orderItems.splice(index, 1);
  }

  closeAmountModal() {
    this.isAmountModalOpen = false;
    this.selectedOrder = null;
  }

  confirmAmountUpdate() {
    if (this.selectedOrder) {
      this.selectedOrder.orderAmount = this.updateAmount;
      this.selectedOrder.orderState = this.selectedOrder.orderState + 1;
      this.dailyOrderService.updateDailyOrder(this.selectedOrder).subscribe({
        next: (response: ResponseDto) => {
          this.loadOrders();
        }
      });
      this.closeAmountModal();
    }
  }

  // Private methods
  private resetForm(): void {
    this.newOrder = {
      customerId: 0,
      orderDetail: '',
      deliveryDate: new Date(),
      orderAmount: 0,
      orderState: 1
    };
  }

  private loadOrders(): void {
    this.dailyOrderService.getDailyOrders().subscribe({
      next: (response: ResponseDto) => {
        this.orders = response.responseObject;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  filterToday() {
    this.selectedDateFilter = 'today';
    const today = new Date();
    this.filter.fromDate = this.datePipe.transform(today, 'yyyy-MM-dd') || '';
    this.filter.toDate = this.filter.fromDate;
    this.filterByDate();
  }

  filterThisMonth() {
    this.selectedDateFilter = 'thisMonth';
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    this.filter.fromDate = this.datePipe.transform(firstDay, 'yyyy-MM-dd') || '';
    this.filter.toDate = this.datePipe.transform(lastDay, 'yyyy-MM-dd') || '';
    this.filterByDate();
  }
  filterByDate(){
    this.dailyOrderService.getDailyOrdersByDate(this.filter).subscribe({
      next: (response: ResponseDto) => {
        this.orders = response.responseObject;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }
  filterAll() {
    this.selectedDateFilter = 'all';
    this.filter.fromDate = '';
    this.filter.toDate = '';
    this.loadOrders();
  }

  filterCustomers() {
    if (!this.customerSearchTerm) {
      this.filteredCustomerIds = this.customerIds;
      return;
    }
    
    const searchTerm = this.customerSearchTerm.toLowerCase();
    this.filteredCustomerIds = this.customerIds.filter(customer => {
      const fullName = `${customer.name} ${customer.surname}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  }

  toggleDropdown(event: Event) {
    event.preventDefault();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.filteredCustomerIds = this.customerIds;
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      });
    }
  }

  selectCustomer(customer: any) {
    this.newOrder.customerId = customer.id;
    this.isDropdownOpen = false;
    this.customerSearchTerm = '';
    this.filterCustomers();
  }
}