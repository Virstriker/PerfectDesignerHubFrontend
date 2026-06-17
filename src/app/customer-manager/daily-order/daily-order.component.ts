import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CustomerServiceService } from '../../services/customer-service.service';
import { Router } from '@angular/router';
import { ResponseDto } from '../../interfaces/customer';
import { DailyOrderServiceService } from '../../services/daily-order-service.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  orders: Array<Order> = [];
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
  filter = { fromDate: '', toDate: '' };
  selectedDateFilter: string = 'all';
  customerSearchTerm: string = '';
  filteredCustomerIds: any[] = [];

  // Sorting
  sortColumn: string = 'deliveryDate';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Column search filters
  colSearch = {
    customer: '',
    detail: '',
    amount: '',
    deliveryDate: ''
  };

  // Custom date range
  customFrom: string = '';
  customTo: string = '';
  showCustomRange: boolean = false;

  @ViewChild('searchInput') searchInput!: ElementRef;
  isDropdownOpen = false;

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.searchInput?.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.customerSearchTerm = '';
      this.filterCustomers();
    }
  }

  constructor(
    private customerService: CustomerServiceService,
    private rout: Router,
    private datePipe: DatePipe,
    private dailyOrderService: DailyOrderServiceService,
    private elementRef: ElementRef
  ) { }

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
    this.loadOrders();
  }

  get filteredOrders(): Order[] {
    let result = this.orders.filter(o => o.orderState === this.selectedStatus);

    if (this.selectedDateFilter === 'today' && this.selectedStatus === 3) {
      result = result.filter(o =>
        new Date(o.deliveryDate).toDateString() === this.currentDate.toDateString()
      );
    }

    // Column filters
    if (this.colSearch.customer) {
      const term = this.colSearch.customer.toLowerCase();
      result = result.filter(o => o.customerName?.toLowerCase().includes(term));
    }
    if (this.colSearch.detail) {
      const term = this.colSearch.detail.toLowerCase();
      result = result.filter(o => o.orderDetail?.toLowerCase().includes(term));
    }
    if (this.colSearch.amount) {
      const amt = Number(this.colSearch.amount);
      if (!isNaN(amt)) result = result.filter(o => o.orderAmount >= amt);
    }
    if (this.colSearch.deliveryDate) {
      result = result.filter(o =>
        this.datePipe.transform(o.deliveryDate, 'yyyy-MM-dd') === this.colSearch.deliveryDate
      );
    }

    // Sorting
    result = [...result].sort((a: any, b: any) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      if (valA === undefined || valB === undefined) return 0;
      let cmp = 0;
      if (typeof valA === 'string') cmp = valA.localeCompare(valB);
      else if (valA instanceof Date || this.sortColumn.toLowerCase().includes('date'))
        cmp = new Date(valA).getTime() - new Date(valB).getTime();
      else cmp = valA - valB;
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });

    this.totalAmount = result.reduce((sum, o) => sum + o.orderAmount, 0);
    return result;
  }

  sortBy(col: string) {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

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
      error: (error) => alert('Error adding order: ' + error.message)
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

  addItem() { this.orderItems.push({ name: '', quantity: 1 }); }
  removeItem(index: number) { this.orderItems.splice(index, 1); }
  closeAmountModal() { this.isAmountModalOpen = false; this.selectedOrder = null; }

  confirmAmountUpdate() {
    if (this.selectedOrder) {
      const updatedOrder = {
        ...this.selectedOrder,
        orderAmount: this.updateAmount,
        orderState: this.selectedOrder.orderState + 1
      };
      this.dailyOrderService.updateDailyOrder(updatedOrder).subscribe({
        next: (response: ResponseDto) => {
          if (response?.isSuccess) {
            this.selectedOrder.orderAmount = updatedOrder.orderAmount;
            this.selectedOrder.orderState = updatedOrder.orderState;
            this.loadOrders();
            this.closeAmountModal();
          } else {
            alert(response?.message || 'Failed to update order.');
          }
        },
        error: (error) => {
          const backendMessage = error?.error?.message || error?.message;
          alert(`Error updating order: ${backendMessage || 'Please try again.'}`);
        }
      });
    }
  }

  filterToday() {
    this.selectedDateFilter = 'today';
    this.showCustomRange = false;
    const today = new Date();
    this.filter.fromDate = this.datePipe.transform(today, 'yyyy-MM-dd') || '';
    this.filter.toDate = this.filter.fromDate;
    this.filterByDate();
  }

  filterThisMonth() {
    this.selectedDateFilter = 'thisMonth';
    this.showCustomRange = false;
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.filter.fromDate = this.datePipe.transform(firstDay, 'yyyy-MM-dd') || '';
    this.filter.toDate = this.datePipe.transform(lastDay, 'yyyy-MM-dd') || '';
    this.filterByDate();
  }

  filterAll() {
    this.selectedDateFilter = 'all';
    this.showCustomRange = false;
    this.filter.fromDate = '';
    this.filter.toDate = '';
    this.loadOrders();
  }

  applyCustomRange() {
    if (!this.customFrom || !this.customTo) {
      alert('Please select both From and To dates');
      return;
    }
    this.selectedDateFilter = 'custom';
    this.filter.fromDate = this.customFrom;
    this.filter.toDate = this.customTo;
    this.filterByDate();
  }

  filterByDate() {
    this.dailyOrderService.getDailyOrdersByDate(this.filter).subscribe({
      next: (response: ResponseDto) => {
        this.orders = response.responseObject.sort((a: Order, b: Order) =>
          new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
        );
      },
      error: (error) => console.error('Error loading orders:', error)
    });
  }

  filterCustomers() {
    if (!this.customerSearchTerm) {
      this.filteredCustomerIds = this.customerIds;
      return;
    }
    const searchTerm = this.customerSearchTerm.toLowerCase();
    this.filteredCustomerIds = this.customerIds.filter(c =>
      `${c.name} ${c.surname}`.toLowerCase().includes(searchTerm)
    );
  }

  toggleDropdown(event: Event) {
    event.preventDefault();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.filteredCustomerIds = this.customerIds;
      setTimeout(() => this.searchInput?.nativeElement?.focus());
    }
  }

  selectCustomer(customer: any) {
    this.newOrder.customerId = customer.id;
    this.isDropdownOpen = false;
    this.customerSearchTerm = `${customer.name} ${customer.surname}`;
    this.filterCustomers();
  }

  clearColSearch() {
    this.colSearch = { customer: '', detail: '', amount: '', deliveryDate: '' };
  }

  private resetForm(): void {
    this.newOrder = {
      customerId: 0,
      orderDetail: '',
      deliveryDate: new Date(),
      orderAmount: 0,
      orderState: 1
    };
    this.customerSearchTerm = '';
  }

  private loadOrders(): void {
    this.dailyOrderService.getDailyOrders().subscribe({
      next: (response: ResponseDto) => {
        this.orders = response.responseObject.sort((a: Order, b: Order) =>
          new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
        );
      },
      error: (error) => console.error('Error loading orders:', error)
    });
  }

  downloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Daily Orders Report', 20, 20);
    doc.setFontSize(12);
    let filterText = `Status: ${this.getStatusText(this.selectedStatus)}`;
    if (this.selectedDateFilter !== 'all') filterText += ` | Filter: ${this.selectedDateFilter}`;
    doc.text(filterText, 20, 30);

    const tableData = this.filteredOrders.map(order => {
      const customer = this.customerIds.find(c => c.id == order.customerId);
      const phone = customer?.phonenumber || customer?.phoneNumber || '';
      const nameWithPhone = phone ? `${order.customerName} (${phone})` : order.customerName;
      return [
        nameWithPhone,
        order.orderDetail,
        this.datePipe.transform(order.deliveryDate, 'shortDate') || '',
        `₹${order.orderAmount}`
      ];
    });
    tableData.push(['', '', 'Total:', `₹${this.totalAmount}`]);

    autoTable(doc, {
      head: [['Customer', 'Detail', 'Delivery Date', 'Amount']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [45, 55, 72], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 }
      }
    });

    const currentDate = new Date().toISOString().split('T')[0];
    doc.save(`daily_orders_${this.getStatusText(this.selectedStatus).toLowerCase()}_${currentDate}.pdf`);
  }
}
