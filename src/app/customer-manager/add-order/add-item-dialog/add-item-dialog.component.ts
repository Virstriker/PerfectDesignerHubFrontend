import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopItem, BottomItem } from '../../../interfaces/order';
import { OrderServiceService } from '../../../services/order-service.service';
import { FEATURES } from '../../../constants/feature-flags';

export interface StepMeta {
  index: number;
  key: string;
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
  neckDesignOptions: string[] = ['A.Work', 'A.Whatsapp', 'MP'];
  neckNumbers: number[] = Array.from({ length: 200 }, (_, i) => i + 1);
  sleeveOptions: string[] = ['Cape', 'Elbow', '3/4th', 'Full'];

  // Options for Bottom
  bottomItemOptions: string[] = ['ChanyaCholi', 'Pant', 'Plazo', 'Dhoti', 'Salvar', 'Sarara'];
  styleOptionsBottom: string[] = ['UmbrellaGher', 'Kali', 'Plits', 'Step'];
  rubberOptions: string[] = ['BeltRubber', 'FullRubber', 'Nadi'];

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
    pad: false,
    sidecut: false,
    piping: '',
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
          item: topItem.item || '',
          style: topItem.style || '',
          frontneckdesign: topItem.frontneckdesign || '',
          backneckdesign: topItem.backneckdesign || '',
          astar: !!topItem.astar,
          openingside: topItem.openingside || '',
          inneck: topItem.inneck || '',
          backofneck: topItem.backofneck || '',
          dori: !!topItem.dori,
          pad: !!topItem.pad,
          sidecut: !!topItem.sidecut,
          piping: topItem.piping || '',
          sleeve: topItem.sleeve || '',
          detail: topItem.detail || '',
          designimage: topItem.designimage || '',
          clothimage: topItem.clothimage || '',
          price: topItem.price || 0
        };
      } else if (this.itemType === 'bottom') {
        const bottomItem = this.itemData as BottomItem;
        this.bottomForm = {
          item: bottomItem.item || '',
          style: bottomItem.style || '',
          rubber: bottomItem.rubber || '',
          pocket: !!bottomItem.pocket,
          detail: bottomItem.detail || '',
          designimage: bottomItem.designimage || '',
          price: bottomItem.price || 0
        };
      }
    }
  }

  get isBlouse(): boolean {
    return (this.topForm.item || '').trim().toLowerCase() === 'blouse';
  }

  get isChaniyaCholi(): boolean {
    const val = (this.bottomForm.item || '').trim().toLowerCase();
    return val === 'chanyacholi' || val === 'chaniya choli' || val === 'chaniyacholi' || val === 'chanya choli';
  }

  get currentSteps(): StepMeta[] {
    if (this.selectedType === 'top') {
      const steps: StepMeta[] = [
        { index: 1, key: 'top_item', title: 'Garment Item', subtitle: 'Select what type of top garment to create', shortLabel: 'Item', icon: 'fa-shirt' }
      ];
      if (this.isBlouse) {
        steps.push({ index: 0, key: 'top_style', title: 'Style & Cut', subtitle: 'Choose the pattern or blouse cut style', shortLabel: 'Style', icon: 'fa-scissors' });
      }
      steps.push(
        { index: 0, key: 'top_front_neck', title: 'Front Neck Design', subtitle: 'Choose neckline style for the front', shortLabel: 'Front Neck', icon: 'fa-shapes' },
        { index: 0, key: 'top_back_neck', title: 'Back Neck Design', subtitle: 'Choose neckline style for the back', shortLabel: 'Back Neck', icon: 'fa-shapes' },
        { index: 0, key: 'top_sleeve', title: 'Sleeve Style', subtitle: 'Select sleeve length or cut pattern', shortLabel: 'Sleeve', icon: 'fa-hand-dots' },
        {
          index: 0,
          key: 'top_options',
          title: 'Options & Extra Detail',
          subtitle: this.isBlouse
            ? 'Configure Open, Dori, Pad, Piping & Extra Detail'
            : 'Configure Astar, SideCut, Piping & Extra Detail',
          shortLabel: 'Options',
          icon: 'fa-sliders'
        },
        { index: 0, key: 'top_price_photos', title: 'Price & Photos', subtitle: 'Set the price and upload reference photos', shortLabel: 'Price & Photos', icon: 'fa-indian-rupee-sign' },
        { index: 0, key: 'top_review', title: 'Review & Confirm', subtitle: 'Review all selected specifications before saving', shortLabel: 'Review', icon: 'fa-circle-check' }
      );
      return steps.map((s, idx) => ({ ...s, index: idx + 1 }));
    }

    if (this.selectedType === 'bottom') {
      const steps: StepMeta[] = [
        { index: 1, key: 'bottom_item', title: 'Garment Item', subtitle: 'Select what type of bottom garment to create', shortLabel: 'Item', icon: 'fa-person' }
      ];
      if (this.isChaniyaCholi) {
        steps.push({ index: 0, key: 'bottom_style', title: 'Style & Cut', subtitle: 'Choose flare or pleat pattern', shortLabel: 'Style', icon: 'fa-scissors' });
      } else {
        steps.push({ index: 0, key: 'bottom_rubber', title: 'Waist & Rubber', subtitle: 'Select waistband elastic or belt preference', shortLabel: 'Waist', icon: 'fa-ring' });
      }
      steps.push(
        { index: 0, key: 'bottom_options', title: 'Options & Notes', subtitle: 'Configure pocket & custom instructions', shortLabel: 'Options', icon: 'fa-sliders' },
        { index: 0, key: 'bottom_price_photo', title: 'Price & Photo', subtitle: 'Set the price and upload design reference photo', shortLabel: 'Price & Photo', icon: 'fa-indian-rupee-sign' },
        { index: 0, key: 'bottom_review', title: 'Review & Confirm', subtitle: 'Review all selected specifications before saving', shortLabel: 'Review', icon: 'fa-circle-check' }
      );
      return steps.map((s, idx) => ({ ...s, index: idx + 1 }));
    }

    return [];
  }

  get totalSteps(): number {
    return this.currentSteps.length;
  }

  get currentStepKey(): string {
    if (this.currentStep === 0) return 'category';
    return this.currentStepMeta?.key || '';
  }

  get currentStepMeta(): StepMeta | null {
    if (this.currentStep === 0) {
      return {
        index: 0,
        key: 'category',
        title: 'Select Garment Category',
        subtitle: 'Choose whether you want to add a Top or Bottom garment',
        shortLabel: 'Category',
        icon: 'fa-tags'
      };
    }
    const meta = this.currentSteps.find(s => s.index === this.currentStep) || null;
    if (meta && !this.showPrice && meta.title.startsWith('Price')) {
      return {
        ...meta,
        title: 'Reference Photos',
        subtitle: this.photoUploadEnabled
          ? 'Upload cloth and design reference photos'
          : 'Photo upload is currently disabled',
        shortLabel: 'Photos',
        icon: 'fa-camera'
      };
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

  goToStepByKey(key: string) {
    this.clearAutoAdvance();
    const target = this.currentSteps.find(s => s.key === key);
    if (target) {
      this.currentStep = target.index;
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

  isNeckNumber(val: string | undefined): boolean {
    if (!val) return false;
    const num = Number(val);
    return Number.isInteger(num) && num >= 1 && num <= 200;
  }

  // Top selection handlers
  selectTopItem(option: string) {
    const prevWasBlouse = this.isBlouse;
    this.topForm.item = option;
    this.onTopItemChanged(prevWasBlouse);
    this.autoAdvance();
  }

  onTopItemInputChange() {
    this.onTopItemChanged();
  }

  private onTopItemChanged(prevWasBlouse?: boolean) {
    const nowBlouse = this.isBlouse;
    if (!nowBlouse) {
      this.topForm.style = '';
      this.topForm.openingside = '';
      this.topForm.dori = false;
      this.topForm.pad = false;
      if (this.topForm.piping === 'Golden' || this.topForm.piping === 'Self') {
        this.topForm.piping = '';
      }
    } else {
      this.topForm.astar = false;
      this.topForm.sidecut = false;
      if (this.topForm.piping === 'Yes' || this.topForm.piping === 'No') {
        this.topForm.piping = '';
      }
    }
  }

  selectTopStyle(option: string) {
    this.topForm.style = option;
    this.autoAdvance();
  }

  selectFrontNeck(option: string) {
    if (!option) return;
    this.topForm.frontneckdesign = String(option);
    this.autoAdvance();
  }

  selectBackNeck(option: string) {
    if (!option) return;
    this.topForm.backneckdesign = String(option);
    this.autoAdvance();
  }

  selectSleeve(option: string) {
    this.topForm.sleeve = option;
    this.autoAdvance();
  }

  // Bottom selection handlers
  selectBottomItem(option: string) {
    this.bottomForm.item = option;
    this.onBottomItemChanged();
    this.autoAdvance();
  }

  onBottomItemChanged() {
    if (this.isChaniyaCholi) {
      this.bottomForm.rubber = '';
    } else {
      this.bottomForm.style = '';
    }
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
      const cleanedTop: TopItem = { ...this.topForm };
      if (!this.isBlouse) {
        cleanedTop.style = '';
        cleanedTop.openingside = '';
        cleanedTop.dori = false;
        cleanedTop.pad = false;
      } else {
        cleanedTop.astar = false;
        cleanedTop.sidecut = false;
      }
      this.saveItem.emit({ type: 'top', item: cleanedTop });
    } else if (this.selectedType === 'bottom') {
      const cleanedBottom: BottomItem = { ...this.bottomForm };
      if (this.isChaniyaCholi) {
        cleanedBottom.rubber = '';
      } else {
        cleanedBottom.style = '';
      }
      this.saveItem.emit({ type: 'bottom', item: cleanedBottom });
    }
    this.close();
  }

  close() {
    this.clearAutoAdvance();
    this.closeDialog.emit();
  }
}
