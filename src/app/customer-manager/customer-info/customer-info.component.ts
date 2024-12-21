import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer, CustomerDetail, OrderCard, ResponseDto } from '../../interfaces/customer';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass, NgFor } from '@angular/common';
import { CustomerServiceService } from '../../services/customer-service.service';
import { HttpClientModule } from '@angular/common/http';
import { OrderServiceService } from '../../services/order-service.service';
import { LoaderComponentComponent } from '../../loader-component/loader-component.component';

@Component({
  selector: 'app-customer-info',
  standalone: true,
  imports: [FormsModule, NgClass, NgFor, CommonModule, HttpClientModule,LoaderComponentComponent],
  providers: [CustomerServiceService, OrderServiceService,LoaderComponentComponent],
  templateUrl: './customer-info.component.html',
  styleUrl: './customer-info.component.css'
})
export class CustomerInfoComponent implements OnInit {
  customerId!: number;
  edit:boolean=true;
  customer: Customer = {
    id: 1,
    name: '',
    surname: '',
    phonenumber: '',
    address: ''
  };
  loading: boolean = true;
  customerOrders: OrderCard[] = [];

  constructor(private route: ActivatedRoute,
    private router:Router,
    private customerService: CustomerServiceService,
    private orderService: OrderServiceService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.customerId = +params['id']; // Convert string to number using '+'
      // Use this.customerId to fetch customer details
    });
    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.customer = response.responseObject;
        } else {
          alert(response.message);
        }
      }
    });
    this.orderService.getAllOrderByCustomerId(this.customerId).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.customerOrders = response.responseObject.sort((a: { orderdate: string | number | Date; }, b: { orderdate: string | number | Date; }) => 
            new Date(b.orderdate).getTime() - new Date(a.orderdate).getTime()
          );
        }
        this.loading = false;
      }
    });
  }
  editCustomer(){
    if(this.edit){
      (document.getElementById("EditCustomer") as HTMLButtonElement).innerText = "Submit";
      this.edit=false;
    }else{
      this.customerService.updateCustomer(this.customer).subscribe({
        next: (response: ResponseDto) => {
          alert(response.message);
        }
      });
      (document.getElementById("EditCustomer") as HTMLButtonElement).innerText = "Edit Customer";
      this.edit=true;
    }
  }
  goBack() {
    // Implement the logic to go back, e.g., navigating to the previous page
    window.history.back();
  }
  goToOrder(id:number){
    this.router.navigateByUrl("/customer-manager/order-info/"+id);
  }
  goToMeasurment(){
    this.router.navigateByUrl('customer-manager/measurement-detail/'+this.customer.id);
  }
}
