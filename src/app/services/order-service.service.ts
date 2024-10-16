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
  completeOrder(Id:number): Observable<ResponseDto> {
    const url = this.baseOrderUrl + "CompleteOrder/"+Id;
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
  getFilterOrders(order:any):Observable<ResponseDto>{
    const url = this.baseOrderUrl + "filterOrders";
    return this.http.post<ResponseDto>(url,order,{ headers: this.getAuthHeaders() });
  }
  generatePdf(data:any): void {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const url = this.constant.pdfUrl+'generate-pdf';
    this.http.post(url, data, { headers, responseType: 'arraybuffer' })
      .subscribe(response => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.name;
        a.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        console.error('Error generating PDF:', error);
      });
  }
  generateReadyMeasurmentPdf(data:any): void {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const url = this.constant.pdfUrl+'generate-measurements-pdf';
    this.http.post(url, data, { headers, responseType: 'arraybuffer' })
      .subscribe(response => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.customerName+"-"+data.id;
        a.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        console.error('Error generating PDF:', error);
      });
  }
}
