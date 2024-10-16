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
  sholder?: string;
  sholderslope?: string;
  neckround?: string;
  frontneckdeep?: string;
  backneckdeep?: string;
  acrossfront?: string;
  acrossback?: string;
  chest?: string;
  bust?: string;
  weist?: string;
  heap?: string;
  armholdleft?: string;
  armholdright?: string;
  bicepleft?: string;
  bicepright?: string;
  mori?: string;
  sleevelength?: string;
  apexpointlength?: string;
  blouselength?: string;
  sidecutlength?: string;
  dresslength?: string;
  onepiecelength?: string;
  pantweist?: string;
  pantheap?: string;
  pantcroch?: string;
  pantjang?: string;
  pantknee?: string;
  pantankel?: string;
  pantmori?: string;
  pantlength?: string;
  chaniyawrist?: string;
  chaniyaheap?: string;
  chaniyalength?: string;
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
    id: 0,
    customerId: 0,
    sholder: '',
    sholderslope: '',
    neckround: '',
    frontneckdeep: '',
    backneckdeep: '',
    acrossfront: '',
    acrossback: '',
    chest: '',
    bust: '',
    weist: '',
    heap: '',
    armholdleft: '',
    armholdright: '',
    bicepleft: '',
    bicepright: '',
    mori: '',
    sleevelength: '',
    apexpointlength: '',
    blouselength: '',
    sidecutlength: '',
    dresslength: '',
    onepiecelength: '',
    pantweist: '',
    pantheap: '',
    pantcroch: '',
    pantjang: '',
    pantknee: '',
    pantankel: '',
    pantmori: '',
    pantlength: '',
    chaniyawrist: '',
    chaniyaheap: '',
    chaniyalength: '',
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
    customerName: this.customerName, 
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
