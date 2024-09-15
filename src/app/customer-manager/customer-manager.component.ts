import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavBarComponent } from "./nav-bar/nav-bar.component";

@Component({
  selector: 'app-customer-manager',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavBarComponent],
  templateUrl: './customer-manager.component.html',
  styleUrl: './customer-manager.component.css'
})
export class CustomerManagerComponent {

}
