import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderServiceService } from '../../services/order-service.service';
import { addOrderDto } from '../../interfaces/order';
import { OrderFormComponent } from '../../shared/order-form/order-form.component';
import { LoaderComponentComponent } from '../../loader-component/loader-component.component';

/**
 * Admin: review one customer-submitted order. Uses the shared order form so the admin can edit items,
 * add prices and a delivery date, then approve (creates the real order) or reject.
 */
@Component({
  selector: 'app-approval-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule, OrderFormComponent, LoaderComponentComponent],
  providers: [OrderServiceService],
  template: `
    <app-loader-component [isLoading]="loading"></app-loader-component>
    <app-order-form *ngIf="initialOrder"
      [title]="'Approve order #' + pendingId"
      submitLabel="Approve order"
      busyLabel="Working..."
      rejectLabel="Reject"
      [showReject]="true"
      [showCustomerSelect]="false"
      [fixedCustomerName]="customerName"
      [customerId]="customerId"
      [showBranch]="false"
      [initialOrder]="initialOrder"
      [busy]="busy"
      (submitted)="approve($event)"
      (rejected)="reject()"
      (back)="goBack()">
    </app-order-form>
  `
})
export class ApprovalDetailComponent implements OnInit {
  pendingId = 0;
  customerId = 0;
  customerName = '';
  initialOrder: addOrderDto | null = null;
  loading = true;
  busy = false;

  constructor(
    private orderService: OrderServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.pendingId = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getPendingOrder(this.pendingId).subscribe({
      next: (response: any) => {
        this.loading = false;
        const p = response.responseObject;
        if (!response.isSuccess || !p || p.status !== 'pending') {
          alert(response.isSuccess ? 'This order was already processed' : (response.message || 'Order not found'));
          this.goBack();
          return;
        }
        this.customerId = Number(p.customerid);
        this.customerName = p.customer;
        this.initialOrder = {
          order: {
            customerid: this.customerId,
            branchname: 'Main',
            orderdate: new Date().toISOString().split('T')[0],
            deliverydate: '',
            totalprice: 0,
            orderstatus: 1
          },
          tops: p.payload?.tops || [],
          bottoms: p.payload?.bottoms || []
        };
      },
      error: () => {
        this.loading = false;
        alert('Could not load this order');
        this.goBack();
      }
    });
  }

  approve(order: addOrderDto) {
    this.busy = true;
    this.orderService.approvePendingOrder(this.pendingId, order).subscribe({
      next: (response: any) => {
        this.busy = false;
        if (response.isSuccess) {
          this.router.navigateByUrl('/customer-manager/order-info/' + response.responseObject.orderId);
        } else {
          alert(response.message || 'Could not approve order');
        }
      },
      error: (error) => {
        this.busy = false;
        alert(error?.error?.message || 'Could not approve order');
      }
    });
  }

  reject() {
    if (!confirm('Reject this order? The customer will not be notified.')) {
      return;
    }
    this.busy = true;
    this.orderService.rejectPendingOrder(this.pendingId).subscribe({
      next: (response: any) => {
        this.busy = false;
        if (response.isSuccess) {
          this.goBack();
        } else {
          alert(response.message || 'Could not reject order');
        }
      },
      error: (error) => {
        this.busy = false;
        alert(error?.error?.message || 'Could not reject order');
      }
    });
  }

  goBack() {
    this.router.navigateByUrl('/customer-manager/approvals');
  }
}
