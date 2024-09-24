import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements  OnInit {
  constructor(private route:Router){}
  title = 'perfect';
  ngOnInit(): void {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   const decodedToken = this.decodeToken(token);
    //   const currentTime = Math.floor(Date.now() / 1000);

    //   if (decodedToken.exp < currentTime) {
    //     localStorage.removeItem('token');
    //     this.route.navigateByUrl('/login');
    //   } else {
    //     this.route.navigateByUrl('/customer-manager');
    //   }
    // } else {
    //   this.route.navigateByUrl('/login');
    // }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }
}
