import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { constant } from '../constants/constants';
import { Observable } from 'rxjs';
import { ResponseDto } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class DailyWorkService {
  constructor(private http: HttpClient, private constant: constant) { }

  baseDailyOrderUrl: string = this.constant.Url + "EmployeeWork/";
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  getDailyWorks(id:number):Observable<ResponseDto>{
    var url = this.baseDailyOrderUrl+"this-month/"+id;
    return this.http.get<ResponseDto>(url,{headers:this.getAuthHeaders()});
  }
  addDailyWork(work:any):Observable<ResponseDto>{
    return this.http.post<ResponseDto>(this.baseDailyOrderUrl,work,{headers:this.getAuthHeaders()});
  }
  getEmployee():Observable<ResponseDto>{
    var url = this.constant.Url +"Employee/";
    return this.http.get<ResponseDto>(url,{headers:this.getAuthHeaders()})
  }
}
