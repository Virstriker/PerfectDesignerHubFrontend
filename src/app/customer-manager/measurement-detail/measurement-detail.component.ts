import { NgFor, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MeasurementServiceService } from '../../services/measurement-service.service';
import { ResponseDto } from '../../interfaces/customer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderServiceService } from '../../services/order-service.service';
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
  providers:[MeasurementServiceService,OrderServiceService],
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
    private measurementsService: MeasurementServiceService,
    private orderService: OrderServiceService
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
    showItemNumberPopup: boolean = false;
    itemNumber: number = 0;
    openPopUp(){
      this.showItemNumberPopup = true;
    }
    confirmItemNumber() {
        // Logic to handle item number confirmation
        alert(`Item number ${this.itemNumber} confirmed!`);
        this.showItemNumberPopup = false;
        this.generateReadyMeasurmentPdf();
    }
    generateReadyMeasurmentPdf(){
      const readyMeasurment = {
        id: this.itemNumber,
    customerName: this.customerName, // This will be passed in as a parameter
    sholder: this.measurements.sholder,
    sholderslope: this.measurements.sholderslope,
    neckround: this.measurements.neckround,
    frontneckdeep: this.measurements.frontneckdeep,
    backneckdeep: this.measurements.backneckdeep,
    acrossfront: this.measurements.acrossfront,
    acrossback: this.measurements.acrossback,
    chest: this.measurements.chest,
    bust: this.measurements.bust,
    weist: this.measurements.weist,
    heap: this.measurements.heap,
    armholdleft: this.measurements.armholdleft,
    armholdright: this.measurements.armholdright,
    bicepleft: this.measurements.bicepleft,
    bicepright: this.measurements.bicepright,
    mori: this.measurements.mori,
    sleevelength: this.measurements.sleevelength,
    apexpointlength: this.measurements.apexpointlength,
    blouselength: this.measurements.blouselength,
    sidecutlength: this.measurements.sidecutlength,
    dresslength: this.measurements.dresslength,
    onepiecelength: this.measurements.onepiecelength,
    pantweist: this.measurements.pantweist,
    pantheap: this.measurements.pantheap,
    pantcroch: this.measurements.pantcroch,
    pantjang: this.measurements.pantjang,
    pantknee: this.measurements.pantknee,
    pantankel: this.measurements.pantankel,
    pantmori: this.measurements.pantmori,
    pantlength: this.measurements.pantlength,
    chaniyawrist: this.measurements.chaniyawrist,
    chaniyaheap: this.measurements.chaniyaheap,
    chaniyalength: this.measurements.chaniyalength
      }
      this.orderService.generateReadyMeasurmentPdf(readyMeasurment)
    }
}