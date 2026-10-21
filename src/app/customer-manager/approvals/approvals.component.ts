import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { OrderServiceService } from '../../services/order-service.service';
import { LoaderComponentComponent } from '../../loader-component/loader-component.component';

/** Admin: list of customer-submitted orders waiting for approval. */
@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, HttpClientModule, LoaderComponentComponent],
  providers: [OrderServiceService],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css'
})
export class ApprovalsComponent implements OnInit {
  pending: any[] = [];
  loading = true;

  constructor(private orderService: OrderServiceService, private router: Router) { }

  ngOnInit(): void {
    this.orderService.getPendingOrders().subscribe({
      next: (response: any) => {
        this.pending = response.isSuccess ? response.responseObject : [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  open(id: number) {
    this.router.navigateByUrl('/customer-manager/approvals/' + id);
  }

  goBack() {
    this.router.navigateByUrl('/customer-manager/order');
  }
}
