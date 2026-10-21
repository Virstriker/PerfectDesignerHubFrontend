import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { OrderServiceService } from '../services/order-service.service';
import { addOrderDto } from '../interfaces/order';
import { OrderFormComponent } from '../shared/order-form/order-form.component';

/**
 * Public (no login) page where a customer adds an order.
 * Step 1: enter the Customer ID given by the shop. Step 2: add items (shared order form). Step 3: confirmation.
 * The order is saved as "pending" and must be approved by the admin.
 */
const STORAGE_KEY = 'public_order_customer';

@Component({
  selector: 'app-public-order',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, OrderFormComponent],
  providers: [OrderServiceService],
  templateUrl: './public-order.component.html',
  styleUrl: './public-order.component.css'
})
export class PublicOrderComponent implements OnInit {
  step: 'id' | 'form' | 'done' = 'id';

  customerIdInput: string | number = '';
  customerId = 0;
  customerName = '';
  verifying = false;
  idError = '';
  submitting = false;

  constructor(private orderService: OrderServiceService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // 1. Check if customer is already stored in browser localStorage
    const savedCustomer = localStorage.getItem(STORAGE_KEY);
    if (savedCustomer) {
      try {
        const parsed = JSON.parse(savedCustomer);
        if (parsed?.id) {
          this.customerId = parsed.id;
          this.customerName = parsed.name || '';
          this.customerIdInput = parsed.id;
          this.step = 'form';
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // 2. Optional: /place-order?id=123 can override or pre-fill
    const queryId = this.route.snapshot.queryParamMap.get('id');
    if (queryId) {
      this.customerIdInput = queryId;
      if (Number(queryId) !== this.customerId) {
        this.step = 'id';
      }
    }
  }

  verify() {
    const raw = String(this.customerIdInput ?? '').trim();
    const id = Number(raw);
    if (!raw || !Number.isInteger(id) || id <= 0) {
      this.idError = 'Please enter a valid customer ID';
      return;
    }
    this.idError = '';
    this.verifying = true;
    this.orderService.verifyPublicCustomer(id).subscribe({
      next: (response: any) => {
        this.verifying = false;
        if (response.isSuccess) {
          this.customerId = response.responseObject.id;
          this.customerName = response.responseObject.name || '';
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            id: this.customerId,
            name: this.customerName
          }));
          this.step = 'form';
        } else {
          this.idError = response.message || 'Customer ID not found';
        }
      },
      error: (error) => {
        this.verifying = false;
        this.idError = error?.error?.message || 'Customer ID not found. Please check with the shop.';
      }
    });
  }

  onSubmitted(order: addOrderDto) {
    this.submitting = true;
    this.orderService.submitPublicOrder({
      customerid: this.customerId,
      tops: order.tops,
      bottoms: order.bottoms
    }).subscribe({
      next: (response: any) => {
        this.submitting = false;
        if (response.isSuccess) {
          this.step = 'done';
        } else {
          alert(response.message || 'Could not submit order');
        }
      },
      error: (error) => {
        this.submitting = false;
        alert(error?.error?.message || 'Could not submit order. Please try again.');
      }
    });
  }

  changeCustomer() {
    localStorage.removeItem(STORAGE_KEY);
    this.step = 'id';
    this.customerIdInput = '';
    this.customerId = 0;
    this.customerName = '';
  }

  addAnother() {
    this.step = 'form';
  }
}
