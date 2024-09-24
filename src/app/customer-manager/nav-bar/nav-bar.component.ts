import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { routes } from '../../app.routes';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [NgIf,RouterLink],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  isOpen = false;
  constructor(private route:Router){}
  toggleMenu() {
    this.isOpen = !this.isOpen;
  }
  logout(){
    localStorage.removeItem("token");
    this.route.navigateByUrl("/login");
  }
}
