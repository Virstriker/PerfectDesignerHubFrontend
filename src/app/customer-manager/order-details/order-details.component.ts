import { Component, OnInit } from '@angular/core';
import { Order, TopItem, BottomItem, addOrderDto } from '../../interfaces/order';
import { ResponseDto } from '../../interfaces/customer';
import { OrderServiceService } from '../../services/order-service.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AddItemDialogComponent } from '../add-order/add-item-dialog/add-item-dialog.component';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, FormsModule, RouterModule, HttpClientModule, AddItemDialogComponent],
  providers: [OrderServiceService],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: addOrderDto = {
    order: {
      customerid: 0,
      branchname: '',
      orderdate: '',
      deliverydate: '',
      totalprice: 0,
      orderstatus: 0
    },
    tops: [],
    bottoms: []
  };
  
  orderId!: number;
  isEditing = false;
  originalOrder: addOrderDto | null = null;
  showItemDialog = false;
  editingItemType: string = '';
  editingItemData: any = null;

  constructor(
    private orderService: OrderServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      this.loadOrderDetails();
    });
  }

  loadOrderDetails() {
    this.orderService.getOrderDetailsById(this.orderId).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.order = response.responseObject;
        }
      },
      error: (error) => {
        console.error('Error loading order details:', error);
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.originalOrder = JSON.parse(JSON.stringify(this.order));
    }
  }

  cancelEdit() {
    if (this.originalOrder) {
      this.order = JSON.parse(JSON.stringify(this.originalOrder));
    }
    this.isEditing = false;
  }

  openItemPopup() {
    this.editingItemType = '';
    this.editingItemData = null;
    this.showItemDialog = true;
  }

  closeItemDialog() {
    this.showItemDialog = false;
    this.editingItemType = '';
    this.editingItemData = null;
  }

  editItem(type: string, index: number) {
    this.editingItemType = type;
    this.editingItemData = type === 'top' ? 
      { ...this.order.tops[index] } : 
      { ...this.order.bottoms[index] };
    this.showItemDialog = true;
  }

  deleteItem(type: string, index: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      if (type === 'top') {
        this.order.tops.splice(index, 1);
      } else {
        this.order.bottoms.splice(index, 1);
      }
    }
  }

  onItemSaved(event: any) {
    if (this.editingItemType === 'top') {
      if (this.editingItemData) {
        // Update existing top item
        const index = this.order.tops.findIndex(item => 
          item === this.editingItemData);
        if (index !== -1) {
          this.order.tops[index] = event;
        } else {
          this.order.tops.push(event);
        }
      } else {
        // Add new top item
        this.order.tops.push(event);
      }
    } else {
      if (this.editingItemData) {
        // Update existing bottom item
        const index = this.order.bottoms.findIndex(item => 
          item === this.editingItemData);
        if (index !== -1) {
          this.order.bottoms[index] = event;
        } else {
          this.order.bottoms.push(event);
        }
      } else {
        // Add new bottom item
        this.order.bottoms.push(event);
      }
    }
    this.closeItemDialog();
  }

  completeOrder() {
    this.orderService.completeOrder(this.orderId).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.loadOrderDetails();
        }
      },
      error: (error) => {
        console.error('Error completing order:', error);
      }
    });
  }

  generateBillPdf() {
    // Implement PDF generation
  }

  goBack() {
    this.router.navigate(['/orders']);
  }
}
