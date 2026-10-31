import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MeasurementServiceService } from '../../services/measurement-service.service';
import { ResponseDto } from '../../interfaces/customer';
import { FormsModule } from '@angular/forms';
import { OrderServiceService } from '../../services/order-service.service';
import { CustomerServiceService } from '../../services/customer-service.service';
import { LoaderComponentComponent } from '../../loader-component/loader-component.component';

export type MeasurementCategory = 'blouse' | 'dress' | 'pant' | 'chaniye';

export interface MeasurementStep {
  index: number;
  key: keyof Measurements;
  label: string;
  placeholder?: string;
  hint?: string;
}

export interface Measurements {
  id: number;
  customerId: number;
  // Blouse measurements
  frontneckdeep?: string;
  backneckdeep?: string;
  apexpointlength?: string;
  blouselength?: string;
  neckround?: string;
  sholder?: string;
  sholderslope?: string;
  acrossfront?: string;
  acrossback?: string;
  chest?: string;
  bust?: string;
  weist?: string;
  armholdleft?: string;
  armholdright?: string;
  bicepleft?: string;
  bicepright?: string;
  sleevelength?: string;
  mori?: string;

  // Dress measurements (stored separately from Blouse)
  dressfrontneckdeep?: string;
  dressbackneckdeep?: string;
  dressapexpointlength?: string;
  sidecutlength?: string;
  dresslength?: string;
  dressneckround?: string;
  dresssholder?: string;
  dresssholderslope?: string;
  dressacrossfront?: string;
  dressacrossback?: string;
  dresschest?: string;
  dressbust?: string;
  dressweist?: string;
  dressheap?: string;
  dressarmholdleft?: string;
  dressarmholdright?: string;
  dressbicepleft?: string;
  dressbicepright?: string;
  dresssleevelength?: string;
  dressmori?: string;

  // Legacy / Misc
  heap?: string;
  onepiecelength?: string;

  // Pant measurements
  pantweist?: string;
  pantheap?: string;
  pantcroch?: string;
  pantjang?: string;
  pantknee?: string;
  pantankel?: string;
  pantmori?: string;
  pantlength?: string;

  // Chaniye measurements
  chaniyawrist?: string;
  chaniyalength?: string;
  chaniyaheap?: string;
}

@Component({
  selector: 'app-measurement-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule, LoaderComponentComponent],
  providers: [MeasurementServiceService, OrderServiceService, CustomerServiceService, LoaderComponentComponent],
  templateUrl: './measurement-detail.component.html',
  styleUrl: './measurement-detail.component.css'
})
export class MeasurementDetailComponent implements OnInit {
  @ViewChild('stepInput') stepInputRef?: ElementRef<HTMLInputElement>;

  loading = true;
  saving = false;
  customerName = '';
  customerId = 0;
  recordExists = false;
  isPrinting = false;

  /** null = showing the 4 category option cards; otherwise showing that category's wizard */
  selectedCategory: MeasurementCategory | null = null;

  /** 1-based step counter inside the selected category. Last step is Review & Confirm */
  currentStep = 1;

  measurements: Measurements = {
    id: 0,
    customerId: 0,
    // Blouse
    frontneckdeep: '',
    backneckdeep: '',
    apexpointlength: '',
    blouselength: '',
    neckround: '',
    sholder: '',
    sholderslope: '',
    acrossfront: '',
    acrossback: '',
    chest: '',
    bust: '',
    weist: '',
    armholdleft: '',
    armholdright: '',
    bicepleft: '',
    bicepright: '',
    sleevelength: '',
    mori: '',
    // Dress
    dressfrontneckdeep: '',
    dressbackneckdeep: '',
    dressapexpointlength: '',
    sidecutlength: '',
    dresslength: '',
    dressneckround: '',
    dresssholder: '',
    dresssholderslope: '',
    dressacrossfront: '',
    dressacrossback: '',
    dresschest: '',
    dressbust: '',
    dressweist: '',
    dressheap: '',
    dressarmholdleft: '',
    dressarmholdright: '',
    dressbicepleft: '',
    dressbicepright: '',
    dresssleevelength: '',
    dressmori: '',
    // Legacy
    heap: '',
    onepiecelength: '',
    // Pant
    pantweist: '',
    pantheap: '',
    pantcroch: '',
    pantjang: '',
    pantknee: '',
    pantankel: '',
    pantmori: '',
    pantlength: '',
    // Chaniye
    chaniyawrist: '',
    chaniyalength: '',
    chaniyaheap: ''
  };

  showItemNumberPopup = false;
  itemNumber = 0;

  // Step definitions for each category
  readonly blouseSteps: MeasurementStep[] = [
    { index: 1, key: 'frontneckdeep', label: 'Front Neck Deep', placeholder: 'e.g. 7', hint: 'Distance from shoulder seam down to front neck point' },
    { index: 2, key: 'backneckdeep', label: 'Back Neck Deep', placeholder: 'e.g. 9', hint: 'Distance from shoulder seam down to back neck point' },
    { index: 3, key: 'apexpointlength', label: 'Apex Point Length', placeholder: 'e.g. 10', hint: 'Distance from high shoulder down to bust apex point' },
    { index: 4, key: 'blouselength', label: 'Blouse Length', placeholder: 'e.g. 14.5', hint: 'Total length of blouse from shoulder to bottom hem' },
    { index: 5, key: 'neckround', label: 'Neck Round', placeholder: 'e.g. 15', hint: 'Circumference around the base of the neck' },
    { index: 6, key: 'sholder', label: 'Shoulder', placeholder: 'e.g. 14', hint: 'Shoulder bone to shoulder bone width across back' },
    { index: 7, key: 'sholderslope', label: 'Shoulder Slope', placeholder: 'e.g. 1.5', hint: 'Shoulder slant drop from collar to shoulder point' },
    { index: 8, key: 'acrossfront', label: 'Across Front', placeholder: 'e.g. 12.5', hint: 'Front width between armhole creases' },
    { index: 9, key: 'acrossback', label: 'Across Back', placeholder: 'e.g. 13.5', hint: 'Back width between armhole creases' },
    { index: 10, key: 'chest', label: 'Chest', placeholder: 'e.g. 36', hint: 'Upper chest circumference around armpits' },
    { index: 11, key: 'bust', label: 'Bust', placeholder: 'e.g. 38', hint: 'Fullest circumference around the bust point' },
    { index: 12, key: 'weist', label: 'Waist', placeholder: 'e.g. 32', hint: 'Circumference at the blouse bottom waistline' },
    { index: 13, key: 'armholdleft', label: 'Armhole Left', placeholder: 'e.g. 16', hint: 'Armhole circumference of left arm' },
    { index: 14, key: 'armholdright', label: 'Armhole Right', placeholder: 'e.g. 16', hint: 'Armhole circumference of right arm' },
    { index: 15, key: 'bicepleft', label: 'Bicep Left', placeholder: 'e.g. 12', hint: 'Bicep circumference of left arm' },
    { index: 16, key: 'bicepright', label: 'Bicep Right', placeholder: 'e.g. 12', hint: 'Bicep circumference of right arm' },
    { index: 17, key: 'sleevelength', label: 'Sleeve Length', placeholder: 'e.g. 10', hint: 'Length from shoulder edge to sleeve hem' },
    { index: 18, key: 'mori', label: 'Mori', placeholder: 'e.g. 11', hint: 'Sleeve opening circumference (wrist/arm round)' }
  ];

  readonly dressSteps: MeasurementStep[] = [
    { index: 1, key: 'dressfrontneckdeep', label: 'Front Neck Deep', placeholder: 'e.g. 6.5', hint: 'Front neck depth from shoulder seam' },
    { index: 2, key: 'dressbackneckdeep', label: 'Back Neck Deep', placeholder: 'e.g. 5', hint: 'Back neck depth from shoulder seam' },
    { index: 3, key: 'dressapexpointlength', label: 'Apex Point Length', placeholder: 'e.g. 10.5', hint: 'Shoulder down to bust apex point' },
    { index: 4, key: 'sidecutlength', label: 'Side Cut Length', placeholder: 'e.g. 21', hint: 'Length from shoulder down to side slit opening' },
    { index: 5, key: 'dresslength', label: 'Dress Length', placeholder: 'e.g. 42', hint: 'Total dress length from shoulder to bottom hem' },
    { index: 6, key: 'dressneckround', label: 'Neck Round', placeholder: 'e.g. 15', hint: 'Circumference around neckline' },
    { index: 7, key: 'dresssholder', label: 'Shoulder', placeholder: 'e.g. 14.5', hint: 'Shoulder width across back' },
    { index: 8, key: 'dresssholderslope', label: 'Shoulder Slope', placeholder: 'e.g. 1.5', hint: 'Shoulder slant drop' },
    { index: 9, key: 'dressacrossfront', label: 'Across Front', placeholder: 'e.g. 13', hint: 'Front width between armhole creases' },
    { index: 10, key: 'dressacrossback', label: 'Across Back', placeholder: 'e.g. 14', hint: 'Back width between armhole creases' },
    { index: 11, key: 'dresschest', label: 'Chest', placeholder: 'e.g. 38', hint: 'Upper chest circumference around armpits' },
    { index: 12, key: 'dressbust', label: 'Bust', placeholder: 'e.g. 40', hint: 'Fullest circumference around bust' },
    { index: 13, key: 'dressweist', label: 'Waist', placeholder: 'e.g. 34', hint: 'Natural waist circumference' },
    { index: 14, key: 'dressheap', label: 'Hip', placeholder: 'e.g. 42', hint: 'Fullest hip circumference' },
    { index: 15, key: 'dressarmholdleft', label: 'Armhole Left', placeholder: 'e.g. 17', hint: 'Armhole circumference of left arm' },
    { index: 16, key: 'dressarmholdright', label: 'Armhole Right', placeholder: 'e.g. 17', hint: 'Armhole circumference of right arm' },
    { index: 17, key: 'dressbicepleft', label: 'Bicep Left', placeholder: 'e.g. 13', hint: 'Bicep circumference of left arm' },
    { index: 18, key: 'dressbicepright', label: 'Bicep Right', placeholder: 'e.g. 13', hint: 'Bicep circumference of right arm' },
    { index: 19, key: 'dresssleevelength', label: 'Sleeve Length', placeholder: 'e.g. 16', hint: 'Length from shoulder to sleeve end' },
    { index: 20, key: 'dressmori', label: 'Mori', placeholder: 'e.g. 10.5', hint: 'Sleeve opening circumference' }
  ];

  readonly pantSteps: MeasurementStep[] = [
    { index: 1, key: 'pantweist', label: 'Pant Waist', placeholder: 'e.g. 32', hint: 'Waist circumference where pant is worn' },
    { index: 2, key: 'pantheap', label: 'Pant Hip', placeholder: 'e.g. 38', hint: 'Fullest hip circumference' },
    { index: 3, key: 'pantcroch', label: 'Pant Crotch', placeholder: 'e.g. 26', hint: 'Crotch depth / rise measurement' },
    { index: 4, key: 'pantjang', label: 'Pant Jang', placeholder: 'e.g. 22', hint: 'Thigh (Jang) circumference' },
    { index: 5, key: 'pantknee', label: 'Pant Knee', placeholder: 'e.g. 16', hint: 'Knee round circumference' },
    { index: 6, key: 'pantankel', label: 'Pant Ankle', placeholder: 'e.g. 12', hint: 'Ankle opening circumference' },
    { index: 7, key: 'pantmori', label: 'Pant Mori', placeholder: 'e.g. 13', hint: 'Bottom leg hem opening (Mori)' },
    { index: 8, key: 'pantlength', label: 'Pant Length', placeholder: 'e.g. 38', hint: 'Total outseam length from waist to ankle' }
  ];

  readonly chaniyeSteps: MeasurementStep[] = [
    { index: 1, key: 'chaniyawrist', label: 'Chaniya Wrist', placeholder: 'e.g. 34', hint: 'Waistband round where Chaniya is tied' },
    { index: 2, key: 'chaniyalength', label: 'Chaniya Length', placeholder: 'e.g. 40', hint: 'Total skirt length from waist to floor/hem' },
    { index: 3, key: 'chaniyaheap', label: 'Chaniya Hip', placeholder: 'e.g. 42', hint: 'Hip circumference for Chaniya flare' }
  ];

  constructor(
    private route: ActivatedRoute,
    private measurementsService: MeasurementServiceService,
    private orderService: OrderServiceService,
    private customerService: CustomerServiceService
  ) {}

  ngOnInit(): void {
    this.customerId = +this.route.snapshot.paramMap.get('id')!;
    this.measurements.customerId = this.customerId;
    this.loadMeasurements(this.customerId);
  }

  // --- Step Wizard Getters ---

  get currentSteps(): MeasurementStep[] {
    if (this.selectedCategory === 'blouse') return this.blouseSteps;
    if (this.selectedCategory === 'dress') return this.dressSteps;
    if (this.selectedCategory === 'pant') return this.pantSteps;
    if (this.selectedCategory === 'chaniye') return this.chaniyeSteps;
    return [];
  }

  get totalMeasurementSteps(): number {
    return this.currentSteps.length;
  }

  /** Total steps includes the final Review & Confirm step */
  get totalSteps(): number {
    return this.totalMeasurementSteps + 1;
  }

  get currentStepMeta(): MeasurementStep | undefined {
    if (this.currentStep <= this.totalMeasurementSteps) {
      return this.currentSteps[this.currentStep - 1];
    }
    return undefined;
  }

  get isReviewStep(): boolean {
    return this.currentStep > this.totalMeasurementSteps;
  }

  get progressPercent(): number {
    if (this.totalSteps === 0) return 0;
    return Math.min(100, Math.round((this.currentStep / this.totalSteps) * 100));
  }

  get currentMeasurementValue(): string {
    if (!this.currentStepMeta) return '';
    const val = (this.measurements as any)[this.currentStepMeta.key];
    return val !== undefined && val !== null ? String(val) : '';
  }

  set currentMeasurementValue(val: string) {
    if (this.currentStepMeta) {
      (this.measurements as any)[this.currentStepMeta.key] = val;
    }
  }

  getStepValue(key: keyof Measurements): string {
    const val = this.measurements[key];
    return val !== undefined && val !== null ? String(val) : '';
  }

  // --- Step Wizard Navigation ---

  selectCategory(cat: MeasurementCategory | null) {
    this.selectedCategory = cat;
    this.currentStep = 1;
    if (cat !== null) {
      this.focusInput();
    }
  }

  nextStep() {
    if (this.currentStep <= this.totalMeasurementSteps) {
      this.currentStep++;
      if (!this.isReviewStep) {
        this.focusInput();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.focusInput();
    } else {
      this.selectedCategory = null;
    }
  }

  goToStep(stepNumber: number) {
    if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
      this.currentStep = stepNumber;
      if (!this.isReviewStep) {
        this.focusInput();
      }
    }
  }

  jumpToReview() {
    this.currentStep = this.totalSteps;
  }

  focusInput() {
    setTimeout(() => {
      if (this.stepInputRef?.nativeElement) {
        this.stepInputRef.nativeElement.focus();
        this.stepInputRef.nativeElement.select();
      }
    }, 60);
  }

  goBack() {
    if (this.selectedCategory !== null) {
      if (this.currentStep > 1) {
        this.prevStep();
      } else {
        this.selectedCategory = null;
      }
    } else {
      window.history.back();
    }
  }

  getCategoryTitle(cat: MeasurementCategory | null): string {
    if (cat === 'blouse') return 'Blouse';
    if (cat === 'dress') return 'Dress';
    if (cat === 'pant') return 'Pant';
    if (cat === 'chaniye') return 'Chaniye';
    return '';
  }

  getCategoryBadgeClass(): string {
    if (this.selectedCategory === 'blouse') return 'blouse-icon';
    if (this.selectedCategory === 'dress') return 'dress-icon';
    if (this.selectedCategory === 'pant') return 'pant-icon';
    if (this.selectedCategory === 'chaniye') return 'chaniye-icon';
    return '';
  }

  getCategoryIcon(): string {
    if (this.selectedCategory === 'blouse') return 'fa-shirt';
    if (this.selectedCategory === 'dress') return 'fa-person-dress';
    if (this.selectedCategory === 'pant') return 'fa-person';
    if (this.selectedCategory === 'chaniye') return 'fa-wand-magic-sparkles';
    return 'fa-ruler';
  }

  getFilledCount(cat: MeasurementCategory): number {
    const isFilled = (v: string | undefined) =>
      v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '0';

    if (cat === 'blouse') {
      return this.blouseSteps.filter(s => isFilled(this.measurements[s.key] as string)).length;
    }
    if (cat === 'dress') {
      return this.dressSteps.filter(s => isFilled(this.measurements[s.key] as string)).length;
    }
    if (cat === 'pant') {
      return this.pantSteps.filter(s => isFilled(this.measurements[s.key] as string)).length;
    }
    if (cat === 'chaniye') {
      return this.chaniyeSteps.filter(s => isFilled(this.measurements[s.key] as string)).length;
    }
    return 0;
  }

  // --- Data Loading & Submission ---

  loadMeasurements(customerId: number) {
    this.measurementsService.getMeasurementById(customerId).subscribe({
      next: (data: ResponseDto) => {
        if (data.isSuccess && data.responseObject) {
          this.recordExists = true;
          this.customerName = data.responseObject.customerName || '';
          this.measurements = {
            ...this.measurements,
            ...data.responseObject
          };
          this.loading = false;
        } else {
          this.fetchCustomerNameFallback(customerId);
        }
      },
      error: () => {
        this.fetchCustomerNameFallback(customerId);
      }
    });
  }

  private fetchCustomerNameFallback(customerId: number) {
    this.customerService.getCustomerById(customerId).subscribe({
      next: (res: ResponseDto) => {
        if (res.isSuccess && res.responseObject) {
          const c = res.responseObject;
          this.customerName = `${c.name || ''} ${c.surname || ''}`.trim();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  submitForm() {
    this.saving = true;
    this.measurements.customerId = this.customerId;
    if (this.recordExists && this.measurements.id) {
      this.measurementsService.updateMeasurements(this.measurements.id, this.measurements).subscribe({
        next: (data: ResponseDto) => {
          this.saving = false;
          if (data.isSuccess) {
            alert('Measurement Updated Successfully');
          } else {
            alert('Measurement failed to update');
          }
        },
        error: () => {
          this.saving = false;
          alert('Measurement failed to update');
        }
      });
    } else {
      this.measurementsService.submitMeasurements(this.measurements).subscribe({
        next: (data: ResponseDto) => {
          this.saving = false;
          if (data.isSuccess) {
            this.recordExists = true;
            if (data.responseObject?.id) {
              this.measurements.id = data.responseObject.id;
            }
            alert('Measurement Added Successfully');
          } else {
            alert('Measurement failed to add');
          }
        },
        error: () => {
          this.saving = false;
          alert('Measurement failed to add');
        }
      });
    }
  }

  openPopUp() {
    this.showItemNumberPopup = true;
  }

  confirmItemNumber() {
    alert(`Item number ${this.itemNumber} confirmed!`);
    this.showItemNumberPopup = false;
    this.generateReadyMeasurmentPdf();
  }

  generateReadyMeasurmentPdf() {
    const useDress = this.selectedCategory === 'dress';
    const readyMeasurment = {
      id: this.itemNumber,
      customerName: this.customerName,
      sholder: useDress ? (this.measurements.dresssholder || this.measurements.sholder || '') : (this.measurements.sholder || this.measurements.dresssholder || ''),
      sholderslope: useDress ? (this.measurements.dresssholderslope || this.measurements.sholderslope || '') : (this.measurements.sholderslope || this.measurements.dresssholderslope || ''),
      neckround: useDress ? (this.measurements.dressneckround || this.measurements.neckround || '') : (this.measurements.neckround || this.measurements.dressneckround || ''),
      frontneckdeep: useDress ? (this.measurements.dressfrontneckdeep || this.measurements.frontneckdeep || '') : (this.measurements.frontneckdeep || this.measurements.dressfrontneckdeep || ''),
      backneckdeep: useDress ? (this.measurements.dressbackneckdeep || this.measurements.backneckdeep || '') : (this.measurements.backneckdeep || this.measurements.dressbackneckdeep || ''),
      acrossfront: useDress ? (this.measurements.dressacrossfront || this.measurements.acrossfront || '') : (this.measurements.acrossfront || this.measurements.dressacrossfront || ''),
      acrossback: useDress ? (this.measurements.dressacrossback || this.measurements.acrossback || '') : (this.measurements.acrossback || this.measurements.dressacrossback || ''),
      chest: useDress ? (this.measurements.dresschest || this.measurements.chest || '') : (this.measurements.chest || this.measurements.dresschest || ''),
      bust: useDress ? (this.measurements.dressbust || this.measurements.bust || '') : (this.measurements.bust || this.measurements.dressbust || ''),
      weist: useDress ? (this.measurements.dressweist || this.measurements.weist || '') : (this.measurements.weist || this.measurements.dressweist || ''),
      heap: this.measurements.dressheap || this.measurements.heap || '',
      armholdleft: useDress ? (this.measurements.dressarmholdleft || this.measurements.armholdleft || '') : (this.measurements.armholdleft || this.measurements.dressarmholdleft || ''),
      armholdright: useDress ? (this.measurements.dressarmholdright || this.measurements.armholdright || '') : (this.measurements.armholdright || this.measurements.dressarmholdright || ''),
      bicepleft: useDress ? (this.measurements.dressbicepleft || this.measurements.bicepleft || '') : (this.measurements.bicepleft || this.measurements.dressbicepleft || ''),
      bicepright: useDress ? (this.measurements.dressbicepright || this.measurements.bicepright || '') : (this.measurements.bicepright || this.measurements.dressbicepright || ''),
      mori: useDress ? (this.measurements.dressmori || this.measurements.mori || '') : (this.measurements.mori || this.measurements.dressmori || ''),
      sleevelength: useDress ? (this.measurements.dresssleevelength || this.measurements.sleevelength || '') : (this.measurements.sleevelength || this.measurements.dresssleevelength || ''),
      apexpointlength: useDress ? (this.measurements.dressapexpointlength || this.measurements.apexpointlength || '') : (this.measurements.apexpointlength || this.measurements.dressapexpointlength || ''),
      blouselength: this.measurements.blouselength || '',
      sidecutlength: this.measurements.sidecutlength || '',
      dresslength: this.measurements.dresslength || '',
      onepiecelength: this.measurements.onepiecelength || '',
      pantweist: this.measurements.pantweist || '',
      pantheap: this.measurements.pantheap || '',
      pantcroch: this.measurements.pantcroch || '',
      pantjang: this.measurements.pantjang || '',
      pantknee: this.measurements.pantknee || '',
      pantankel: this.measurements.pantankel || '',
      pantmori: this.measurements.pantmori || '',
      pantlength: this.measurements.pantlength || '',
      chaniyawrist: this.measurements.chaniyawrist || '',
      chaniyaheap: this.measurements.chaniyaheap || '',
      chaniyalength: this.measurements.chaniyalength || ''
    };
    this.orderService.generateReadyMeasurmentPdf(readyMeasurment);
  }
}
