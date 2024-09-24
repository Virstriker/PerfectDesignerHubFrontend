import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { constant } from '../constants/constants';
import { Observable } from 'rxjs';
import { LoginDto } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  constructor(private http: HttpClient, private constant: constant) { }

  login(loginDto: LoginDto): Observable<any> {
    const url = `${this.constant.Url}Login/AdminLogin`;
    return this.http.post(url, loginDto);
  }
}
