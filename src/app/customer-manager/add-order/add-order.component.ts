import { NgClass, NgFor, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {ReactiveFormsModule, NgModelGroup, FormsModule } from '@angular/forms';
import { OrderServiceService } from '../../services/order-service.service';
import { ResponseDto } from '../../interfaces/customer';
import { CustomerServiceService } from '../../services/customer-service.service';
import { Router } from '@angular/router';
interface Ordertable {
  customerId?: number;
  branchName?: string;
  orderDate?: string;
  deliveryDate?: string;
  totalPrice?: number;
  orderstatus?:boolean;
}

interface addOrderDto{
  ordertable :Ordertable;
  blouses:Array<Blouse>;
  dresses:Array<Dress>;
  pants:Array<Pant>;
  chaniyo:Array<Chaniyo>;
}

interface Blouse {
  style?: string;
  neckDesign?: string;
  astar?: boolean;
  openingSide?: string;
  neck?: string;
  dori?: boolean;
  sleeve?: string;
  detail?: string;
  clothimage?: string;
  desingimage?: string;
  price?: number;
}

interface Dress {
  style?: string;
  neckDesign?: string;
  astar?: boolean;
  openingSide?: string;
  backOfNeck?: string;
  chain?: boolean;
  sleeve?: string;
  detail?: string;
  clothimage?: string;
  desingimage?: string;
  price?: number;
}

interface Chaniyo {
  style?: string;
  detail?: string;
  clothimage?: string;
  desingimage?: string;
  price?: number;
}

interface Pant {
  rubberT?: string;
  neckDesign?: string;
  pocket?: boolean;
  detail?: string;
  price?: number;
}
@Component({
  selector: 'app-add-order',
  standalone: true,
  imports: [NgClass, NgFor, CommonModule, HttpClientModule,ReactiveFormsModule,FormsModule],
  providers:[OrderServiceService,CustomerServiceService],
  templateUrl: './add-order.component.html',
  styleUrl: './add-order.component.css'
})
export class AddOrderComponent implements OnInit{
  order: Ordertable = {};
  constructor(private  orderService: OrderServiceService,
    private customerService:CustomerServiceService,
    private rout:Router
  ) {}

  // Arrays to hold added items
  blouses: Blouse[] = [];
  dresses: Dress[] = [];
  chaniyos: Chaniyo[] = [];
  pants: Pant[] = [];

  // Pop-up visibility flags
  showBlousePopup = false;
  showDressPopup = false;
  showChaniyoPopup = false;
  showPantPopup = false;

  // New item variables for pop-ups
  newBlouse: Blouse = {};
  newDress: Dress = {};
  newChaniyo: Chaniyo = {};
  newPant: Pant = {};

  // Methods to open pop-ups
  openBlousePopup() {
      this.showBlousePopup = true; 
      this.newBlouse = {}; // Reset for new entry
  }

  openDressPopup() {
      this.showDressPopup = true; 
      this.newDress = {}; // Reset for new entry
  }

  openChaniyoPopup() {
      this.showChaniyoPopup = true; 
      this.newChaniyo = {}; // Reset for new entry
  }

  openPantPopup() {
      this.showPantPopup = true; 
      this.newPant = {}; // Reset for new entry
  }

  // Methods to add items
  addBlouse() {
      if (this.newBlouse.style && this.newBlouse.price) {
          this.blouses.push(this.newBlouse);
          this.showBlousePopup = false; // Close popup after adding
      }
  }

  addDress() {
      if (this.newDress.style && this.newDress.price) {
          this.dresses.push(this.newDress);
          this.showDressPopup = false; // Close popup after adding
      }
  }

  addChaniyo() {
      if (this.newChaniyo.style && this.newChaniyo.price) {
          this.chaniyos.push(this.newChaniyo);
          this.showChaniyoPopup = false; // Close popup after adding
      }
  }

  addPant() {
      if (this.newPant.rubberT && this.newPant.price) {
          this.pants.push(this.newPant);
          this.showPantPopup = false; // Close popup after adding
      }
  }
  onBlouseDesignImageUpload(event: any) {
    const file = event.target.files[0];
    this.orderService.getImageUrl(file).subscribe({
      next: (Data) => {
        this.newBlouse.desingimage = Data.data.display_url;
    }
    })
  }
  onBlouseClothImageUpload(event:any){
    const file = event.target.files[0];
    this.orderService.getImageUrl(file).subscribe({
      next: (Data) => {
        this.newBlouse.clothimage = Data.data.display_url;
    }
    })
  }

  onDressDesignImageUpload(event: any) {
    const file = event.target.files[0];
    this.orderService.getImageUrl(file).subscribe({
      next: (Data) => {
        this.newDress.desingimage = Data.data.display_url;
    }
    })
  }
  onDressClothImageUpload(event:any){
    const file = event.target.files[0];
    this.orderService.getImageUrl(file).subscribe({
      next: (Data) => {
        this.newDress.clothimage = Data.data.display_url;
    }
    })
  }

  onChaniyoDesignImageUpload(event: any) {
    const file = event.target.files[0];
    this.orderService.getImageUrl(file).subscribe({
      next: (Data) => {
        this.newChaniyo.desingimage = Data.data.display_url;
    }
    })
    console.log(this.newChaniyo);
  }
  onChaniyoClothImageUpload(event:any){
    const file = event.target.files[0];
    this.orderService.getImageUrl(file).subscribe({
      next: (Data) => {
        this.newChaniyo.clothimage = Data.data.display_url;
    }
    })
    console.log(this.newChaniyo);
  }
  
 addOrder:addOrderDto={
  ordertable:{},
  blouses:[],
  chaniyo:[],
  dresses:[],
  pants:[],
 };
  onSubmit(){
    this.order.orderDate = new Date().toDateString();
    this.addOrder.ordertable = this.order;
    this.addOrder.blouses = this.blouses;
    this.addOrder.chaniyo = this.chaniyos;
    this.addOrder.dresses = this.dresses;
    this.addOrder.pants = this.pants;
    this.addOrder.ordertable.orderstatus = true;
    console.log(this.addOrder);
    this.orderService.addOrder(this.addOrder).subscribe({
      next:(response:ResponseDto)=>{
        if(response.isSuccess){
          alert("Order Added");
          this.rout.navigateByUrl("/customer-manager/order");
        }else{
          alert("Order Not Added");
        }
      }
    });
  }
  customerIds: any[] = [];
  ngOnInit(){
    this.customerService.getAllCustomer().subscribe({
      next:(response:ResponseDto)=>{
        this.customerIds = response.responseObject;
      }
    });
  }
}
