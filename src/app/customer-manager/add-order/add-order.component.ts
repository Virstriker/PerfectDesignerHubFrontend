import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderServiceService } from '../../services/order-service.service';
import { CustomerServiceService } from '../../services/customer-service.service';
import { addOrderDto, TopItem, BottomItem } from '../../interfaces/order';
import { AddItemDialogComponent } from './add-item-dialog/add-item-dialog.component';

@Component({
  standalone: true,
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  imports: [FormsModule, HttpClientModule, CommonModule, AddItemDialogComponent],
  providers: [OrderServiceService, CustomerServiceService, DatePipe],
  styleUrls: ['./add-order.component.css']
})
export class AddOrderComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

  order: addOrderDto = {
    order: {
      customerid: 0,
      branchname: 'Main',
      orderdate: new Date().toISOString().split('T')[0],
      deliverydate: '',
      totalprice: 0,
      orderstatus: 1
    },
    tops: [],
    bottoms: []
  };

  showItemDialog = false;
  editingItemType: 'top' | 'bottom' | null = null;
  editingItemData: TopItem | BottomItem | null = null;
  editingItemIndex: number | null = null;
  customerIds: any[] = [];
  customerSearchTerm: string = '';
  filteredCustomerIds: any[] = [];
  isDropdownOpen = false;

  constructor(
    private orderService: OrderServiceService,
    private customerService: CustomerServiceService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.getAllCustomer().subscribe({
      next: (response: any) => {
        if (response.responseObject) {
          this.customerIds = response.responseObject.sort((a: any, b: any) =>
            (a.name + ' ' + a.surname).localeCompare(b.name + ' ' + b.surname)
          );
          this.filteredCustomerIds = this.customerIds;
        }
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  openItemPopup() {
    this.showItemDialog = true;
    this.editingItemType = null;
    this.editingItemData = null;
    this.editingItemIndex = null;
  }

  closeItemDialog() {
    this.showItemDialog = false;
  }

  editItem(type: 'top' | 'bottom', index: number) {
    this.editingItemType = type;
    this.editingItemIndex = index;
    const item = type === 'top' ? this.order.tops[index] : this.order.bottoms[index];
    this.editingItemData = JSON.parse(JSON.stringify(item)); // Deep copy to preserve all fields
    this.showItemDialog = true;
  }

  onItemSaved(event: { type: string; item: TopItem | BottomItem }) {
    if (this.editingItemIndex !== null) {
      if (event.type === 'top') {
        this.order.tops[this.editingItemIndex] = event.item as TopItem;
      } else {
        this.order.bottoms[this.editingItemIndex] = event.item as BottomItem;
      }
    } else {
      if (event.type === 'top') {
        this.order.tops.push(event.item as TopItem);
      } else {
        this.order.bottoms.push(event.item as BottomItem);
      }
    }
    this.calculateTotalPrice();
    this.closeItemDialog();
  }

  calculateTotalPrice() {
    let total = 0;
    this.order.tops.forEach(item => total += item.price);
    this.order.bottoms.forEach(item => total += item.price);
    this.order.order.totalprice = total;
  }

  onSubmit() {
    if (!this.order.order.customerid) {
      alert('Please select a customer');
      return;
    }

    if (!this.order.order.deliverydate) {
      alert('Please select a delivery date');
      return;
    }

    const formattedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    if (formattedDate) {
      this.order.order.orderdate = formattedDate;
    } else {
      console.error('Failed to format date');
      return;
    }

    this.orderService.addOrder(this.order).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          alert('Order Added Successfully');
          this.router.navigateByUrl('/customer-manager/order');
        } else {
          alert('Failed to add order');
        }
      },
      error: (error) => {
        console.error('Error adding order:', error);
        alert('Failed to add order');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.searchInput && !this.searchInput.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.customerSearchTerm = '';
      this.filterCustomers();
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.filterCustomers();
    }
  }

  filterCustomers() {
    if (!this.customerSearchTerm) {
      this.filteredCustomerIds = this.customerIds;
    } else {
      const searchTerm = this.customerSearchTerm.toLowerCase();
      this.filteredCustomerIds = this.customerIds.filter(customer => 
        customer.phonenumber.toString().includes(searchTerm)
      );
    }
  }

  selectCustomer(customer: any) {
    this.order.order.customerid = customer.id;
    this.isDropdownOpen = false;
    this.customerSearchTerm = '';
    this.filterCustomers();
  }
}
