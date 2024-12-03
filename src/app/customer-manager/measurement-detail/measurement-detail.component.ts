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
  imports: [CommonModule,FormsModule,RouterModule,HttpClientModule],
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
  isPrinting = false;

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
    printThermal() {
      if (this.isPrinting) return;
      
      const measurementFields = [
        { label: 'Front Neck Deep', value: this.measurements.frontneckdeep },
        { label: 'Back Neck Deep', value: this.measurements.backneckdeep },
        { label: 'Apex Point Length', value: this.measurements.apexpointlength },
        { label: 'Blouse Length', value: this.measurements.blouselength },
        { label: 'Side Cut Length', value: this.measurements.sidecutlength },
        { label: 'Dress Length', value: this.measurements.dresslength },
        { label: 'Neck Round', value: this.measurements.neckround },
        { label: 'Shoulder', value: this.measurements.sholder },
        { label: 'Shoulder Slope', value: this.measurements.sholderslope },
        { label: 'Across Front', value: this.measurements.acrossfront },
        { label: 'Across Back', value: this.measurements.acrossback },
        { label: 'Chest', value: this.measurements.chest },
        { label: 'Bust', value: this.measurements.bust },
        { label: 'Waist', value: this.measurements.weist },
        { label: 'Hip', value: this.measurements.heap },
        { label: 'Armhole Left', value: this.measurements.armholdleft },
        { label: 'Armhole Right', value: this.measurements.armholdright },
        { label: 'Bicep Left', value: this.measurements.bicepleft },
        { label: 'Bicep Right', value: this.measurements.bicepright },
        { label: 'Sleeve Length', value: this.measurements.sleevelength },
        { label: 'Mori', value: this.measurements.mori },
        { label: 'Pant Waist', value: this.measurements.pantweist },
        { label: 'Pant Hip', value: this.measurements.pantheap },
        { label: 'Pant Crotch', value: this.measurements.pantcroch },
        { label: 'Pant Jang', value: this.measurements.pantjang },
        { label: 'Pant Knee', value: this.measurements.pantknee },
        { label: 'Pant Ankle', value: this.measurements.pantankel },
        { label: 'Pant Mori', value: this.measurements.pantmori },
        { label: 'Pant Length', value: this.measurements.pantlength },
        { label: 'Chaniya Wrist', value: this.measurements.chaniyawrist },
        { label: 'Chaniya Length', value: this.measurements.chaniyalength },
        { label: 'Chaniya Hip', value: this.measurements.chaniyaheap },
        { label: 'One Piece Length', value: this.measurements.onepiecelength }
      ];

      this.isPrinting = true;
      const originalContent = document.body.innerHTML;

      try {
        const printContent = `
          <div style="
            font-family: monospace;
            font-size: 16px;
            font-weight: bold;
            padding: 8px;
            max-width: 58mm;
            margin: 0 auto;
            color: black;
          ">
            <div style="text-align: center; font-size: 18px; margin-bottom: 8px;">
              ${this.customerName}
            </div>
            <div style="border-top: 1px solid black; margin: 4px 0;"></div>
            <pre style="white-space: pre-line; margin: 0;">${
              measurementFields
                .filter(field => field.value && field.value.toString() !== '0')
                .map(field => `${field.label}: ${field.value}`)
                .join('\n')
            }</pre>
          </div>
        `;

        document.body.innerHTML = printContent;
        window.print();
      } catch (error) {
        console.error('Print error:', error);
        alert('There was an error while trying to print. Please try again.');
      } finally {
        setTimeout(() => {
          document.body.innerHTML = originalContent;
          this.isPrinting = false;
        }, 250);
      }
    }
}
