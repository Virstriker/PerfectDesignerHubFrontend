import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CustomerServiceService } from '../../services/customer-service.service';
import { addOrderDto, TopItem, BottomItem } from '../../interfaces/order';
import { AddItemDialogComponent } from '../../customer-manager/add-order/add-item-dialog/add-item-dialog.component';

/**
 * Generic order form used by:
 *  - Admin "Add order"            (everything on, direct add)
 *  - Public customer page         (no customer picker / branch / delivery date / price)
 *  - Admin approval detail        (fixed customer, delivery date + prices, approve / reject)
 * Change the layout or items UI here once and it applies to all three.
 */
@Component({
  standalone: true,
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  imports: [FormsModule, HttpClientModule, CommonModule, AddItemDialogComponent],
  providers: [CustomerServiceService, DatePipe],
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit, OnChanges {
  @ViewChild('searchInput') searchInput!: ElementRef;

  // ----- Configuration -----
  @Input() title = 'Add order';
  @Input() showBack = true;
  @Input() showCustomerSelect = true;
  /** Read-only customer name shown when the picker is hidden (e.g. approval page). */
  @Input() fixedCustomerName = '';
  @Input() showBranch = true;
  @Input() showDeliveryDate = true;
  @Input() showPrice = true;
  @Input() allowPhotoUpload = true;
  @Input() showReject = false;
  @Input() submitLabel = 'Submit order';
  @Input() busyLabel = 'Submitting order...';
  @Input() rejectLabel = 'Reject';
  /** Parent sets this while its API call is running. */
  @Input() busy = false;
  /** Used when the picker is hidden and the customer is already known. */
  @Input() customerId: number | null = null;
  /** Pre-fill the form (approval page). */
  @Input() initialOrder: addOrderDto | null = null;

  @Output() submitted = new EventEmitter<addOrderDto>();
  @Output() rejected = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

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

  minDate: string = new Date().toISOString().split('T')[0];
  showItemDialog = false;
  editingItemType: 'top' | 'bottom' | null = null;
  editingItemData: TopItem | BottomItem | null = null;
  editingItemIndex: number | null = null;
  customerIds: any[] = [];
  customerSearchTerm = '';
  filteredCustomerIds: any[] = [];
  isDropdownOpen = false;

  constructor(
    private customerService: CustomerServiceService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    if (this.showCustomerSelect) {
      this.loadCustomers();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialOrder'] && this.initialOrder) {
      const copy: addOrderDto = JSON.parse(JSON.stringify(this.initialOrder));
      copy.order.deliverydate = copy.order.deliverydate ? String(copy.order.deliverydate).split('T')[0] : '';
      this.order = copy;
      this.calculateTotalPrice();
    }
  }

  get hasDetailsColumn(): boolean {
    return this.showCustomerSelect || !!this.fixedCustomerName || this.showBranch || this.showDeliveryDate;
  }

  get selectedCustomer(): any {
    return this.customerIds.find(c => c.id === this.order.order.customerid) || null;
  }

  get selectedCustomerName(): string {
    const c = this.selectedCustomer;
    return c ? `${c.name} ${c.surname || ''}`.trim() : '';
  }

  get totalItemCount(): number {
    return (this.order.tops?.length || 0) + (this.order.bottoms?.length || 0);
  }

  loadCustomers() {
    this.customerService.getAllCustomer().subscribe({
      next: (response: any) => {
        if (response.responseObject) {
          this.customerIds = response.responseObject.sort((a: any, b: any) =>
            (a.name + ' ' + (a.surname || '')).localeCompare(b.name + ' ' + (b.surname || ''))
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
    this.editingItemData = JSON.parse(JSON.stringify(item));
    this.showItemDialog = true;
  }

  removeItem(type: 'top' | 'bottom', index: number) {
    if (type === 'top') {
      this.order.tops.splice(index, 1);
    } else {
      this.order.bottoms.splice(index, 1);
    }
    this.calculateTotalPrice();
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
    this.order.tops.forEach(item => total += (item.price || 0));
    this.order.bottoms.forEach(item => total += (item.price || 0));
    this.order.order.totalprice = total;
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.filterCustomers();
      setTimeout(() => {
        if (this.searchInput?.nativeElement) {
          this.searchInput.nativeElement.focus();
        }
      }, 50);
    }
  }

  filterCustomers() {
    if (!this.customerSearchTerm.trim()) {
      this.filteredCustomerIds = this.customerIds;
    } else {
      const term = this.customerSearchTerm.toLowerCase().trim();
      this.filteredCustomerIds = this.customerIds.filter(customer => {
        const fullName = `${customer.name || ''} ${customer.surname || ''}`.toLowerCase();
        const phone = (customer.phonenumber || '').toString();
        return fullName.includes(term) || phone.includes(term);
      });
    }
  }

  selectCustomer(customer: any) {
    this.order.order.customerid = customer.id;
    this.isDropdownOpen = false;
    this.customerSearchTerm = '';
    this.filterCustomers();
  }

  goBack() {
    this.back.emit();
  }

  onReject() {
    this.rejected.emit();
  }

  onSubmit() {
    if (!this.showCustomerSelect && this.customerId) {
      this.order.order.customerid = this.customerId;
    }

    if (this.showCustomerSelect && !this.order.order.customerid) {
      alert('Please select a customer');
      return;
    }

    if (this.showDeliveryDate && !this.order.order.deliverydate) {
      alert('Please select a delivery date');
      return;
    }

    if (this.totalItemCount === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    const formattedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    if (!formattedDate) {
      console.error('Failed to format date');
      return;
    }
    this.order.order.orderdate = formattedDate;
    this.calculateTotalPrice();

    this.submitted.emit(JSON.parse(JSON.stringify(this.order)));
  }
}
