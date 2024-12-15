import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopItem, BottomItem } from '../../../interfaces/order';
import { OrderServiceService } from '../../../services/order-service.service';

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
  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveItem = new EventEmitter<{ type: string; item: TopItem | BottomItem }>();

  selectedType: 'top' | 'bottom' | null = null;
  showDialog = true;

  topOptions: string[] = ['Blouse', 'Kurti', 'OnePiece', 'ShortTop', 'Frok', 'Dress', 'Kfatan', 'SimpleSalvar' , 'Shrug', 'Blazer', 'peplem','CropTop'];
  frontNeckDesignOptions: string[] = ['Boat', 'Stand', 'Round', 'A.Work', 'A.Whatsapp', 'A.Measurment', 'Image'];
  backNeckDesignOptions: string[] = ['Boat', 'Stand', 'Round', 'A.Work', 'A.Whatsapp', 'A.Measurment', 'Image'];
  styleOptions: string[] = ['PrincessCut', 'Katori', '4Gents', 'Pad'];
  openingsideOptions: string[] = ['Front', 'Back', 'Side', 'Chain'];
  inneckOptions: string[] = ['Piping', 'UrepPatti', 'Canvas', 'Hemming', 'Dori'];
  backofneckOptions: string[] = ['Deep' ,'Pack'];
  sleeveOptions: string[] = ['SleeveLess', 'Cape', 'Elbow', '3/4th', 'Full'];

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
    sleeve: '',
    detail: '',
    price: 0
  };

  bottomForm: BottomItem = {
    item: '',
    style: '',
    rubber: '',
    pocket: false,
    detail: '',
    price: 0
  };

  constructor(private orderService: OrderServiceService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['itemType'] && this.itemType) {
      this.selectedType = this.itemType;
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

  selectType(type: 'top' | 'bottom') {
    this.selectedType = type;
  }

  // Top form methods
  selectTopItem(option: string) {
    this.topForm.item = option;
  }

  selectTopStyle(option: string) {
    this.topForm.style = option;
  }

  selectFrontNeck(option: string) {
    this.topForm.frontneckdesign = option;
  }

  selectBackNeck(option: string) {
    this.topForm.backneckdesign = option;
  }

  selectOpeningSide(option: string) {
    this.topForm.openingside = option;
  }

  selectInNeck(option: string) {
    this.topForm.inneck = option;
  }

  selectBackOfNeck(option: string) {
    this.topForm.backofneck = option;
  }

  selectSleeve(option: string) {
    this.topForm.sleeve = option;
  }

  // Bottom form methods
  selectBottomItem(option: string) {
    this.bottomForm.item = option;
  }

  selectBottomStyle(option: string) {
    this.bottomForm.style = option;
  }

  selectRubber(option: string) {
    this.bottomForm.rubber = option;
  }

  onClothImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.orderService.getImageUrl(file).subscribe({
        next: (response: any) => {
          if (response.data?.display_url) {
            this.topForm.clothimage = response.data.display_url;
          }
        },
        error: (error) => {
          console.error('Error uploading cloth image:', error);
        }
      });
    }
  }

  onDesignImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.orderService.getImageUrl(file).subscribe({
        next: (response: any) => {
          if (response.data?.display_url) {
            if (this.selectedType === 'top') {
              this.topForm.designimage = response.data.display_url;
            } else {
              this.bottomForm.designimage = response.data.display_url;
            }
          }
        },
        error: (error) => {
          console.error('Error uploading design image:', error);
        }
      });
    }
  }

  onSave() {
    if (this.selectedType === 'top') {
      this.saveItem.emit({ type: 'top', item: this.topForm });
    } else if (this.selectedType === 'bottom') {
      this.saveItem.emit({ type: 'bottom', item: this.bottomForm });
    }
    this.close();
  }

  close() {
    this.closeDialog.emit();
  }
}
