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
  url = 'https://api.imgbb.com/1/upload?key=b6d6c1051566438a8d968fa96b850f87';
  responseImage!:any;
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

  getImageUrl(file:any): Observable<any>{
    const formData: FormData = new FormData();
    formData.append('image', file);
    return this.http.post(this.url, formData);
  }
  addOrder(order:any): Observable<ResponseDto>{
    const url = this.baseOrderUrl + "AddNewOrder";
    return this.http.post<ResponseDto>(url, order,{ headers: this.getAuthHeaders() });
  }
  getBillPdf(order:any):Observable<Blob>{
    const url = this.baseOrderUrl + "GenerateBill";
    return this.http.post<Blob>(url, order,{ headers: this.getAuthHeaders() });
  }
}
