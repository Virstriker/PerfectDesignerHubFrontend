import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopItem, BottomItem } from '../../../interfaces/order';
import { OrderServiceService } from '../../../services/order-service.service';
import { FEATURES } from '../../../constants/feature-flags';

export interface StepMeta {
  index: number;
  title: string;
  subtitle: string;
  shortLabel: string;
  icon: string;
}

@Component({
  selector: 'app-add-item-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-item-dialog.component.html',
  styleUrls: ['./add-item-dialog.component.css']
})
export class AddItemDialogComponent implements OnChanges {
  @Input() itemType: 'top' | 'bottom' | null = null;
  @Input() itemData: TopItem | BottomItem | null = null;
  /** Hide the amount/price field (e.g. on the public customer page). */
  @Input() showPrice = true;
  /** Controlled globally or by parent component */
  @Input() allowPhotoUpload = true;
  get photoUploadEnabled(): boolean {
    return this.allowPhotoUpload && FEATURES.photoUpload;
  }
  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveItem = new EventEmitter<{ type: string; item: TopItem | BottomItem }>();

  selectedType: 'top' | 'bottom' | null = null;
  showDialog = true;
  currentStep = 0; // 0 = Category selection (Top/Bottom)

  // Options for Top
  topOptions: string[] = ['Blouse', 'Kurti', 'OnePiece', 'ShortTop', 'Frok', 'Dress', 'Kfatan', 'SimpleSalvar', 'Shrug', 'Blazer', 'peplem', 'CropTop'];
  styleOptions: string[] = ['PrincessCut', 'PrincessCut(Pad)', 'Katori', '4Gents', 'SabiyaSachi'];
  frontNeckDesignOptions: string[] = ['Boat', 'Stand', 'Round', 'A.Work', 'A.Whatsapp', 'A.Measurment', 'Image'];
  backNeckDesignOptions: string[] = ['Boat', 'Stand', 'Round', 'A.Work', 'A.Whatsapp', 'A.Measurment', 'Image'];
  openingsideOptions: string[] = ['Front', 'Back', 'Side', 'Chain'];
  inneckOptions: string[] = ['Piping', 'UrepPatti', 'Canvas', 'Hemming', 'Supplimentry'];
  backofneckOptions: string[] = ['Deep', 'Pack'];
  sleeveOptions: string[] = ['SleeveLess', 'Cape', 'Elbow', '3/4th', 'Full'];

  // Options for Bottom
  bottomItemOptions: string[] = ['ChanyaCholi', 'Pant', 'Plazo', 'Dhoti', 'Salvar', 'Sarara'];
  styleOptionsBottom: string[] = ['UmbrellaGher', 'Kali', 'Plits', 'Step'];
  rubberOptions: string[] = ['BeltRubber', 'FullRubber', 'Nadi'];

  // Step definitions for Top
  readonly topSteps: StepMeta[] = [
    { index: 1, title: 'Garment Item', subtitle: 'Select what type of top garment to create', shortLabel: 'Item', icon: 'fa-shirt' },
    { index: 2, title: 'Style & Cut', subtitle: 'Choose the pattern or blouse cut style', shortLabel: 'Style', icon: 'fa-scissors' },
    { index: 3, title: 'Front Neck Design', subtitle: 'Choose neckline style for the front', shortLabel: 'Front Neck', icon: 'fa-shapes' },
    { index: 4, title: 'Back Neck Design', subtitle: 'Choose neckline style for the back', shortLabel: 'Back Neck', icon: 'fa-shapes' },
    { index: 5, title: 'Opening Side', subtitle: 'Select where the hooks or zipper will be placed', shortLabel: 'Opening', icon: 'fa-door-open' },
    { index: 6, title: 'In-Neck Finishing', subtitle: 'Select internal neck finishing technique', shortLabel: 'In Neck', icon: 'fa-ribbon' },
    { index: 7, title: 'Back Neck Depth', subtitle: 'Select depth preference for back neckline', shortLabel: 'Neck Depth', icon: 'fa-arrows-up-down' },
    { index: 8, title: 'Sleeve Style', subtitle: 'Select sleeve length or cut pattern', shortLabel: 'Sleeve', icon: 'fa-hand-dots' },
    { index: 9, title: 'Options & Notes', subtitle: 'Configure Astar, Dori & custom instructions', shortLabel: 'Options', icon: 'fa-sliders' },
    { index: 10, title: 'Price & Photos', subtitle: 'Set the price and upload reference photos', shortLabel: 'Price & Photos', icon: 'fa-indian-rupee-sign' },
    { index: 11, title: 'Review & Confirm', subtitle: 'Review all selected specifications before saving', shortLabel: 'Review', icon: 'fa-circle-check' }
  ];

  // Step definitions for Bottom
  readonly bottomSteps: StepMeta[] = [
    { index: 1, title: 'Garment Item', subtitle: 'Select what type of bottom garment to create', shortLabel: 'Item', icon: 'fa-person' },
    { index: 2, title: 'Style & Cut', subtitle: 'Choose flare or pleat pattern', shortLabel: 'Style', icon: 'fa-scissors' },
    { index: 3, title: 'Waist & Rubber', subtitle: 'Select waistband elastic or belt preference', shortLabel: 'Waist', icon: 'fa-ring' },
    { index: 4, title: 'Options & Notes', subtitle: 'Configure pocket & custom instructions', shortLabel: 'Options', icon: 'fa-sliders' },
    { index: 5, title: 'Price & Photo', subtitle: 'Set the price and upload design reference photo', shortLabel: 'Price & Photo', icon: 'fa-indian-rupee-sign' },
    { index: 6, title: 'Review & Confirm', subtitle: 'Review all selected specifications before saving', shortLabel: 'Review', icon: 'fa-circle-check' }
  ];

  topForm: TopItem = {
    item: '',
    style: '',
    frontneckdesign: '',
    backneckdesign: '',
    astar: false,
    openingside: '',
    inneck: '',
    backofneck: '',
    dori: false,
    sleeve: '',
    detail: '',
    clothimage: '',
    designimage: '',
    price: 0
  };

  bottomForm: BottomItem = {
    item: '',
    style: '',
    rubber: '',
    pocket: false,
    detail: '',
    designimage: '',
    price: 0
  };

  isUploadingCloth = false;
  isUploadingDesign = false;
  uploadClothError = '';
  uploadDesignError = '';

  // Local instant preview URLs (before upload finishes)
  clothLocalPreview = '';
  designLocalPreview = '';

  // Lightbox Preview Modal
  previewModalOpen = false;
  previewModalUrl = '';
  previewModalTitle = '';

  private autoAdvanceTimer: any = null;

  constructor(private orderService: OrderServiceService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['itemType'] && this.itemType) {
      this.selectedType = this.itemType;
      this.currentStep = 1; // Direct jump to first question when editing or pre-selected
    }
    if (changes['itemData'] && this.itemData) {
      if (this.itemType === 'top') {
        const topItem = this.itemData as TopItem;
        this.topForm = {
          ...topItem,
          designimage: topItem.designimage || '',
          clothimage: topItem.clothimage || ''
        };
      } else if (this.itemType === 'bottom') {
        const bottomItem = this.itemData as BottomItem;
        this.bottomForm = {
          ...bottomItem,
          designimage: bottomItem.designimage || ''
        };
      }
    }
  }

  get currentSteps(): StepMeta[] {
    if (this.selectedType === 'top') return this.topSteps;
    if (this.selectedType === 'bottom') return this.bottomSteps;
    return [];
  }

  get totalSteps(): number {
    return this.currentSteps.length;
  }

  get currentStepMeta(): StepMeta | null {
    if (this.currentStep === 0) {
      return {
        index: 0,
        title: 'Select Garment Category',
        subtitle: 'Choose whether you want to add a Top or Bottom garment',
        shortLabel: 'Category',
        icon: 'fa-tags'
      };
    }
    const meta = this.currentSteps.find(s => s.index === this.currentStep) || null;
    if (meta && !this.showPrice && meta.title.startsWith('Price')) {
      return { ...meta, title: 'Reference Photos', subtitle: 'Photo upload is currently unavailable', shortLabel: 'Photos', icon: 'fa-camera' };
    }
    return meta;
  }

  get progressPercent(): number {
    if (this.currentStep === 0 || this.totalSteps === 0) return 0;
    return Math.round((this.currentStep / this.totalSteps) * 100);
  }

  get isLastStep(): boolean {
    return this.selectedType !== null && this.currentStep === this.totalSteps;
  }

  get isReviewStep(): boolean {
    return this.isLastStep;
  }

  // Navigation handlers
  selectType(type: 'top' | 'bottom') {
    this.selectedType = type;
    this.currentStep = 1;
  }

  nextStep() {
    this.clearAutoAdvance();
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    this.clearAutoAdvance();
    if (this.currentStep > 1) {
      this.currentStep--;
    } else if (this.currentStep === 1) {
      // If user came here from type selection, go back to step 0
      this.currentStep = 0;
      if (!this.itemType) {
        this.selectedType = null;
      }
    } else if (this.currentStep === 0) {
      this.close();
    }
  }

  goToStep(stepNumber: number) {
    this.clearAutoAdvance();
    if (stepNumber >= 0 && stepNumber <= this.totalSteps) {
      this.currentStep = stepNumber;
    }
  }

  jumpToReview() {
    this.clearAutoAdvance();
    this.currentStep = this.totalSteps;
  }

  private autoAdvance() {
    this.clearAutoAdvance();
    this.autoAdvanceTimer = setTimeout(() => {
      this.nextStep();
    }, 220);
  }

  private clearAutoAdvance() {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  // Top selection handlers
  selectTopItem(option: string) {
    this.topForm.item = option;
    this.autoAdvance();
  }

  selectTopStyle(option: string) {
    this.topForm.style = option;
    this.autoAdvance();
  }

  selectFrontNeck(option: string) {
    this.topForm.frontneckdesign = option;
    this.autoAdvance();
  }

  selectBackNeck(option: string) {
    this.topForm.backneckdesign = option;
    this.autoAdvance();
  }

  selectOpeningSide(option: string) {
    this.topForm.openingside = option;
    this.autoAdvance();
  }

  selectInNeck(option: string) {
    this.topForm.inneck = option;
    this.autoAdvance();
  }

  selectBackOfNeck(option: string) {
    this.topForm.backofneck = option;
    this.autoAdvance();
  }

  selectSleeve(option: string) {
    this.topForm.sleeve = option;
    this.autoAdvance();
  }

  // Bottom selection handlers
  selectBottomItem(option: string) {
    this.bottomForm.item = option;
    this.autoAdvance();
  }

  selectBottomStyle(option: string) {
    this.bottomForm.style = option;
    this.autoAdvance();
  }

  selectRubber(option: string) {
    this.bottomForm.rubber = option;
    this.autoAdvance();
  }

  // Quick price helper
  setPrice(amount: number) {
    if (this.selectedType === 'top') {
      this.topForm.price = amount;
    } else if (this.selectedType === 'bottom') {
      this.bottomForm.price = amount;
    }
  }

  addPrice(delta: number) {
    if (this.selectedType === 'top') {
      this.topForm.price = Math.max(0, (this.topForm.price || 0) + delta);
    } else if (this.selectedType === 'bottom') {
      this.bottomForm.price = Math.max(0, (this.bottomForm.price || 0) + delta);
    }
  }

  // Image Uploads (Google Drive)
  onClothImageUpload(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const oldImage = this.topForm.clothimage;
      // Instant local preview
      this.clothLocalPreview = URL.createObjectURL(file);
      this.isUploadingCloth = true;
      this.uploadClothError = '';
      this.orderService.getImageUrl(file).subscribe({
        next: (response: any) => {
          this.isUploadingCloth = false;
          const uploadedUrl = response?.responseObject?.url
            || response?.data?.display_url
            || response?.data?.url
            || response?.responseObject?.thumbnailUrl;
          if (uploadedUrl) {
            if (oldImage && oldImage !== uploadedUrl) {
              this.orderService.deleteImage(oldImage).subscribe({
                next: () => console.log('Previous cloth image cleaned from Drive'),
                error: (e) => console.warn('Could not delete old cloth image:', e)
              });
            }
            this.topForm.clothimage = uploadedUrl;
            this.clothLocalPreview = '';
          }
        },
        error: (error) => {
          this.isUploadingCloth = false;
          this.clothLocalPreview = '';
          this.uploadClothError = error?.error?.message || 'Failed to upload image to Google Drive. Please try again.';
          console.error('Error uploading cloth image:', error);
        }
      });
    }
  }

  removeClothImage() {
    const existingUrl = this.topForm.clothimage;
    if (existingUrl) {
      this.orderService.deleteImage(existingUrl).subscribe({
        next: () => console.log('Cloth image deleted from Google Drive'),
        error: (err) => console.warn('Could not delete cloth image from Google Drive:', err)
      });
    }
    this.topForm.clothimage = '';
    this.clothLocalPreview = '';
    this.isUploadingCloth = false;
    this.uploadClothError = '';
  }

  onDesignImageUpload(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const oldImage = this.selectedType === 'top' ? this.topForm.designimage : this.bottomForm.designimage;
      // Instant local preview
      this.designLocalPreview = URL.createObjectURL(file);
      this.isUploadingDesign = true;
      this.uploadDesignError = '';
      this.orderService.getImageUrl(file).subscribe({
        next: (response: any) => {
          this.isUploadingDesign = false;
          const uploadedUrl = response?.responseObject?.url
            || response?.data?.display_url
            || response?.data?.url
            || response?.responseObject?.thumbnailUrl;
          if (uploadedUrl) {
            if (oldImage && oldImage !== uploadedUrl) {
              this.orderService.deleteImage(oldImage).subscribe({
                next: () => console.log('Previous design image cleaned from Drive'),
                error: (e) => console.warn('Could not delete old design image:', e)
              });
            }
            if (this.selectedType === 'top') {
              this.topForm.designimage = uploadedUrl;
            } else {
              this.bottomForm.designimage = uploadedUrl;
            }
            this.designLocalPreview = '';
          }
        },
        error: (error) => {
          this.isUploadingDesign = false;
          this.designLocalPreview = '';
          this.uploadDesignError = error?.error?.message || 'Failed to upload image to Google Drive. Please try again.';
          console.error('Error uploading design image:', error);
        }
      });
    }
  }

  removeDesignImage() {
    const existingUrl = this.selectedType === 'top' ? this.topForm.designimage : this.bottomForm.designimage;
    if (existingUrl) {
      this.orderService.deleteImage(existingUrl).subscribe({
        next: () => console.log('Design image deleted from Google Drive'),
        error: (err) => console.warn('Could not delete design image from Google Drive:', err)
      });
    }
    if (this.selectedType === 'top') {
      this.topForm.designimage = '';
    } else {
      this.bottomForm.designimage = '';
    }
    this.designLocalPreview = '';
    this.isUploadingDesign = false;
    this.uploadDesignError = '';
  }

  openPreviewModal(url?: string | null, title: string = 'Image Preview') {
    if (!url) return;
    this.previewModalUrl = url;
    this.previewModalTitle = title;
    this.previewModalOpen = true;
  }

  closePreviewModal() {
    this.previewModalOpen = false;
    this.previewModalUrl = '';
    this.previewModalTitle = '';
  }

  onSave() {
    this.clearAutoAdvance();
    if (this.isUploadingCloth || this.isUploadingDesign) {
      alert('Please wait for photo upload to finish.');
      return;
    }
    if (this.selectedType === 'top') {
      this.saveItem.emit({ type: 'top', item: { ...this.topForm } });
    } else if (this.selectedType === 'bottom') {
      this.saveItem.emit({ type: 'bottom', item: { ...this.bottomForm } });
    }
    this.close();
  }

  close() {
    this.clearAutoAdvance();
    this.closeDialog.emit();
  }
}
