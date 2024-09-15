import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CustomerManagerComponent } from './customer-manager/customer-manager.component';
import { CustomerComponent } from './customer-manager/customer/customer.component';
import { CustomerInfoComponent } from './customer-manager/customer-info/customer-info.component';

export const routes: Routes = [
    {path:'login',component:LoginComponent},
    {path:'customer-manager',component:CustomerManagerComponent,children:[
        {path:'customer',component:CustomerComponent},
        {path:'customer-info/:id',component:CustomerInfoComponent}
    ]}
];
