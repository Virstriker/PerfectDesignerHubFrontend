import { NgFor, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MeasurementServiceService } from '../../services/measurement-service.service';
import { ResponseDto } from '../../interfaces/customer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
export interface Measurements {
  id: number;
  customerId: number;
  sholder?: number;
  sholderslope?: number;
  neckround?: number;
  frontneckdeep?: number;
  backneckdeep?: number;
  acrossfront?: number;
  acrossback?: number;
  chest?: number;
  bust?: number;
  weist?: number;
  heap?: number;
  armholdleft?: number;
  armholdright?: number;
  bicepleft?: number;
  bicepright?: number;
  mori?: number;
  sleevelength?: number;
  apexpointlength?: number;
  blouselength?: number;
  sidecutlength?: number;
  dresslength?: number;
  onepiecelength?: number;
  pantweist?: number;
  pantheap?: number;
  pantcroch?: number;
  pantjang?: number;
  pantknee?: number;
  pantankel?: number;
  pantmori?: number;
  pantlength?: number;
  chaniyawrist?: number;
  chaniyaheap?: number;
  chaniyalength?: number;
}
@Component({
  selector: 'app-measurement-detail',
  standalone: true,
  imports: [NgFor,CommonModule,FormsModule,RouterModule,HttpClientModule],
  providers:[MeasurementServiceService],
  templateUrl: './measurement-detail.component.html',
  styleUrl: './measurement-detail.component.css'
})
export class MeasurementDetailComponent implements OnInit {
  customerName!:string;
  measurements: Measurements = {
    id:0,
    customerId: 0,
    sholder: 0,
    sholderslope: 0,
    neckround: 0,
    frontneckdeep: 0,
    backneckdeep: 0,
    acrossfront: 0,
    acrossback: 0,
    chest: 0,
    bust: 0,
    weist: 0,
    heap: 0,
    armholdleft: 0,
    armholdright: 0,
    bicepleft: 0,
    bicepright: 0,
    mori: 0,
    sleevelength: 0,
    apexpointlength: 0,
    blouselength: 0,
    sidecutlength: 0,
    dresslength: 0,
    onepiecelength: 0,
    pantweist: 0,
    pantheap: 0,
    pantcroch: 0,
    pantjang: 0,
    pantknee: 0,
    pantankel: 0,
    pantmori: 0,
    pantlength: 0,
    chaniyawrist: 0,
    chaniyaheap: 0,
    chaniyalength: 0,
  };
  recordExists = false;

  constructor(
    private route: ActivatedRoute,
    private measurementsService: MeasurementServiceService
  ) {
  }
  customerId : number = 0;

  ngOnInit(): void {
    this.customerId = +this.route.snapshot.paramMap.get('id')!;
    this.measurements.customerId = this.customerId;
    this.loadMeasurements(this.customerId);
  }

  loadMeasurements(customerId: number) {
    this.measurementsService.getMeasurementById(customerId).subscribe({
      next:(data: ResponseDto) => {
        if (data.isSuccess) {
          this.recordExists = true;
          this.customerName = data.responseObject.customerName;
          this.measurements = data.responseObject; 
        } else {
          alert("no data")
        }
      },
    })
    console.log(this.measurements); 
  }

  submitForm() {
    if(this.recordExists){
      this.measurements.customerId = this.customerId;
      this.measurementsService.updateMeasurements(this.measurements.id,this.measurements).subscribe({
        next: (data:ResponseDto) => {
            if(data.isSuccess){
              alert("Measurment Updated")
            }else{
              alert("Measurment failed")
            }
        }
      });
    }else{
        this.measurementsService.submitMeasurements(this.measurements).subscribe({
          next: (data:ResponseDto) => {
              if(data.isSuccess){
                alert("Measurment Added")
              }else{
                alert("Measurment failed")
              }
          }
        });
      }
    }
}