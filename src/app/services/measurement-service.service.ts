import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { constant } from '../constants/constants';
import { Observable } from 'rxjs';
import { ResponseDto } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class MeasurementServiceService {

  constructor(private http: HttpClient, private constant: constant) { }

  baseOrderUrl: string = this.constant.Url + "Measurment/";
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  getMeasurementById(id: any): Observable<ResponseDto> {
    const url = this.baseOrderUrl+"customer/"+id;
    return this.http.get<ResponseDto>(url, { headers: this.getAuthHeaders() });
  }
  submitMeasurements(Measurment:any):Observable<ResponseDto>{
    const url = this.baseOrderUrl;
    return this.http.post<ResponseDto>(url,Measurment, { headers: this.getAuthHeaders() });
  }
  updateMeasurements(id:any,Measurment:any):Observable<ResponseDto>{
    const url = this.baseOrderUrl+id;
    return this.http.put<ResponseDto>(url,Measurment, { headers: this.getAuthHeaders() });
  }
}
