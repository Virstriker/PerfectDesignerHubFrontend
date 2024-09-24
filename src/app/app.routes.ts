import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CustomerManagerComponent } from './customer-manager/customer-manager.component';
import { CustomerComponent } from './customer-manager/customer/customer.component';
import { CustomerInfoComponent } from './customer-manager/customer-info/customer-info.component';
import { OrderComponent } from './customer-manager/order/order.component';
import { OrderDetailsComponent } from './customer-manager/order-details/order-details.component';
import { AddOrderComponent } from './customer-manager/add-order/add-order.component';

export const routes: Routes = [
    {path:'login',component:LoginComponent},
    {path:'customer-manager',component:CustomerManagerComponent,children:[
        {path:'customer',component:CustomerComponent},
        {path:'customer-info/:id',component:CustomerInfoComponent},
        {path:'order',component:OrderComponent},
        {path:'order-info/:id',component:OrderDetailsComponent},
        {path:'add-order',component:AddOrderComponent}
    ]}
];
