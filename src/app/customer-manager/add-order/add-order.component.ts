import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { OrderServiceService } from '../../services/order-service.service';
import { addOrderDto } from '../../interfaces/order';
import { OrderFormComponent } from '../../shared/order-form/order-form.component';

/** Admin "Add order": thin wrapper around the shared order form. Orders created here are added directly. */
@Component({
  standalone: true,
  selector: 'app-add-order',
  template: `
    <app-order-form
      title="Add order"
      submitLabel="Submit order"
      [busy]="submitting"
      (submitted)="onSubmit($event)"
      (back)="goBack()">
    </app-order-form>
  `,
  imports: [CommonModule, HttpClientModule, OrderFormComponent],
  providers: [OrderServiceService]
})
export class AddOrderComponent {
  submitting = false;

  constructor(
    private orderService: OrderServiceService,
    private router: Router
  ) { }

  goBack() {
    this.router.navigateByUrl('/customer-manager/order');
  }

  onSubmit(order: addOrderDto) {
    this.submitting = true;
    this.orderService.addOrder(order).subscribe({
      next: (response: any) => {
        this.submitting = false;
        if (response.isSuccess) {
          alert('Order Added Successfully');
          this.router.navigateByUrl('/customer-manager/order');
        } else {
          alert('Failed to add order');
        }
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error adding order:', error);
        alert('Failed to add order');
      }
    });
  }
}
