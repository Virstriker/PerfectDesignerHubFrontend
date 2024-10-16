import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { constant } from '../constants/constants';
import { Observable } from 'rxjs';
import { Customer, CustomerAdd, ResponseDto } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerServiceService {
  constructor(private http: HttpClient, private constant: constant) { }

  basCustomerUrl: string = this.constant.Url + "Customer/";

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllCustomer(): Observable<ResponseDto> {
    const url = this.basCustomerUrl + "GetAllCustomers";
    return this.http.get<ResponseDto>(url, { headers: this.getAuthHeaders() });
  }

  addCustomer(customer:CustomerAdd): Observable<ResponseDto> {
    const url = this.basCustomerUrl + "AddCustomer";
    return this.http.post<ResponseDto>(url,customer ,{ headers: this.getAuthHeaders() });
  }

  searchCustomer(name:string):Observable<ResponseDto>{
    const url = this.basCustomerUrl + "SearchCustomer/"+name;
    return this.http.get<ResponseDto>(url, { headers: this.getAuthHeaders() });
  }

  getCustomerById(id:number):Observable<ResponseDto>{
    const url = this.basCustomerUrl + "findById/"+id;
    return this.http.get<ResponseDto>(url, { headers: this.getAuthHeaders() });
  }
  updateCustomer(customer:any):Observable<ResponseDto>{
    const url = this.basCustomerUrl + "UpdateCustomer";
    return this.http.post<ResponseDto>(url,customer ,{ headers: this.getAuthHeaders() });
  }
}
