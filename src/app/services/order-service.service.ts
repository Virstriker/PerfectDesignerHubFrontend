import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { constant } from '../constants/constants';
import { ResponseDto } from '../interfaces/customer';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class OrderServiceService {

  constructor(private http: HttpClient, private constant: constant) { }

  baseOrderUrl: string = this.constant.Url + "Order/";

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllOrders(): Observable<ResponseDto> {
    const url = this.baseOrderUrl + "GetAllOrders";
    return this.http.get<ResponseDto>(url, { headers: this.getAuthHeaders() });
  }

  getAllOrderByCustomerId(customerId:number): Observable<ResponseDto> {
    const url = this.baseOrderUrl + "GetOrderByCustomerId/"+customerId;
    return this.http.get<ResponseDto>(url, { headers: this.getAuthHeaders() });
  }

  getOrderDetailsById(Id:number): Observable<ResponseDto> {
    const url = this.baseOrderUrl + "GetOrderId/"+Id;
    return this.http.get<ResponseDto>(url, { headers: this.getAuthHeaders() });
  }
}
