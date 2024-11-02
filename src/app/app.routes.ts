import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CustomerManagerComponent } from './customer-manager/customer-manager.component';
import { CustomerComponent } from './customer-manager/customer/customer.component';
import { CustomerInfoComponent } from './customer-manager/customer-info/customer-info.component';
import { OrderComponent } from './customer-manager/order/order.component';
import { OrderDetailsComponent } from './customer-manager/order-details/order-details.component';
import { AddOrderComponent } from './customer-manager/add-order/add-order.component';
import { MeasurementComponent } from './customer-manager/measurement/measurement.component';
import { MeasurementDetailComponent } from './customer-manager/measurement-detail/measurement-detail.component';
import { SiteHomePageComponent } from './site-home-page/site-home-page.component';
import { OrderNotificationComponent } from './customer-manager/order-notification/order-notification.component';
import { DailyOrderComponent } from './customer-manager/daily-order/daily-order.component';

export const routes: Routes = [
    {path:'',component:SiteHomePageComponent},
    {path:'login',component:LoginComponent},
    {path:'customer-manager',component:CustomerManagerComponent,children:[
        {path:'',component:CustomerComponent},
        {path:'customer-info/:id',component:CustomerInfoComponent},
        {path:'order',component:OrderComponent},
        {path:'order-info/:id',component:OrderDetailsComponent},
        {path:'add-order',component:AddOrderComponent},
        {path:'measurement',component:MeasurementComponent},
        {path:'measurement-detail/:id',component:MeasurementDetailComponent},
        {path:'notification',component:OrderNotificationComponent},
        {path:'daily-order',component:DailyOrderComponent}
    ]}
];
