import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { constant } from '../constants/constants';
import { Observable } from 'rxjs/internal/Observable';
import { ResponseDto } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class DailyOrderServiceService {

  constructor(private http: HttpClient, private constant: constant) { }

  baseDailyOrderUrl: string = this.constant.Url + "DailyOrder/";

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  public getDailyOrders(): Observable<ResponseDto> {
    return this.http.get<ResponseDto>(this.baseDailyOrderUrl,{headers:this.getAuthHeaders()});
  }
  public addDailyOrder(order:any):Observable<ResponseDto>{
    return this.http.post<ResponseDto>(this.baseDailyOrderUrl,order,{headers:this.getAuthHeaders()});
  }
  public updateDailyOrder(order:any):Observable<ResponseDto>{
    var url = this.baseDailyOrderUrl+"status/"+order.id+"/"+order.orderState;
    return this.http.put<ResponseDto>(url,order.orderAmount,{headers:this.getAuthHeaders()});
  }
}
