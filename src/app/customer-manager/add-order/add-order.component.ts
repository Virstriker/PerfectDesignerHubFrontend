import { NgClass, NgFor, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-add-order',
  standalone: true,
  imports: [NgClass, NgFor, CommonModule, HttpClientModule,ReactiveFormsModule],
  templateUrl: './add-order.component.html',
  styleUrl: './add-order.component.css'
})
export class AddOrderComponent implements OnInit {
  orderForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      ordertable: this.fb.group({
        customerid: ['', Validators.required],
        branchname: ['', Validators.required],
        orderdate: ['', Validators.required],
        deliverydate: ['', Validators.required],
        totalPrice: [0, Validators.required]
      }),
      blouses: this.fb.array([]),
      dresses: this.fb.array([]),
      chaniyo: this.fb.array([]),
      pants: this.fb.array([])
    });
  }

  // Getters for FormArrays
  get blouses(): FormArray {
    return this.orderForm.get('blouses') as FormArray;
  }

  get dresses(): FormArray {
    return this.orderForm.get('dresses') as FormArray;
  }

  get chaniyo(): FormArray {
    return this.orderForm.get('chaniyo') as FormArray;
  }

  get pants(): FormArray {
    return this.orderForm.get('pants') as FormArray;
  }

  // Add Blouse
  addBlouse() {
    const blouseGroup = this.fb.group({
      style: ['', Validators.required],
      neckdesign: [''],
      astar: [false],
      openingside: [''],
      neck: [''],
      dori: [false],
      sleeve: [''],
      detail: [''],
      clothimage: [''],
      desingimage: [''],
      price: [0, Validators.required]
    });
    this.blouses.push(blouseGroup);
  }

  // Add Dress
  addDress() {
    const dressGroup = this.fb.group({
      style: ['', Validators.required],
      neckdesign: [''],
      astar: [false],
      openingside: [''],
      backofneck: [''],
      chain: [false],
      sleeve: [''],
      detail: [''],
      clothimage: [''],
      desingimage: [''],
      price: [0, Validators.required]
    });
    this.dresses.push(dressGroup);
  }

  // Add Chaniyo
  addChaniyo() {
    const chaniyoGroup = this.fb.group({
      style: ['', Validators.required],
      detail: [''],
      clothimage: [''],
      desingimage: [''],
      price: [0, Validators.required]
    });
    this.chaniyo.push(chaniyoGroup);
  }

  // Add Pant
  addPant() {
    const pantGroup = this.fb.group({
      rubbert: [''],
      neckdesign: [''],
      pocket: [false],
      detail: [''],
      price: [0, Validators.required]
    });
    this.pants.push(pantGroup);
  }

  // Submit Form
  submitOrder() {
    if (this.orderForm.valid) {
      console.log(this.orderForm.value);
      // Submit to the backend API here
    }
  }
}
