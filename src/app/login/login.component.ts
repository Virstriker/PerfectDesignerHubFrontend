import { Component } from '@angular/core';
import { LoginServiceService } from '../services/login-service.service';
import { LoginDto, ResponseDto } from '../interfaces/customer';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule,FormsModule],
  providers:  [LoginServiceService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginDto: LoginDto = {};

  constructor(private loginService: LoginServiceService,
    private route:Router
  ) { }

  login() {
    const username = (document.getElementById('username') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;

    if (username && password) {
      this.loginDto.userid = username;
      this.loginDto.userpassword = password;

      this.loginService.login(this.loginDto).subscribe(
        (response:ResponseDto) => {
          if(response.isSuccess){
            localStorage.setItem("token",response.responseObject);
            this.showToast('Login successful!');
            setTimeout(() => {
              this.route.navigateByUrl("/customer-manager");
            }, 500);
          }else{
            this.showToast(response.message);
          }
        },
        (error) => {
          console.error('Login failed', error);
          this.showToast('Login failed. Please try again.');
        }
      );
    } else {
      console.error('Username or password is missing');
      this.showToast('Username or password is missing');
    }
  }

  showToast(message: string) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.className = 'toast show';
      setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
    }
  }
}
