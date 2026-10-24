import { Component, OnInit } from '@angular/core';
import { Order, TopItem, BottomItem, addOrderDto, getOrderDto } from '../../interfaces/order';
import { ResponseDto } from '../../interfaces/customer';
import { OrderServiceService } from '../../services/order-service.service';
import { CommonModule, NgFor, NgIf, DatePipe, CurrencyPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AddItemDialogComponent } from '../add-order/add-item-dialog/add-item-dialog.component';
import { LoaderComponentComponent } from '../../loader-component/loader-component.component';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, FormsModule, RouterModule, HttpClientModule, AddItemDialogComponent, LoaderComponentComponent],
  providers: [OrderServiceService, LoaderComponentComponent, DatePipe, CurrencyPipe],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: getOrderDto = {
    order: {
      customerid: 0,
      customer: '',
      branchname: 'Main',
      orderdate: '',
      deliverydate: '',
      totalprice: 0,
      orderstatus: 0,
      phonenumber: 0
    },
    tops: [],
    bottoms: []
  };
  loading: boolean = true;
  orderId!: number;
  isEditing = false;
  originalOrder: addOrderDto | null = null;
  showItemDialog = false;
  showWhatsAppDialog = false;
  showQRDialog = false;
  editingItemType: 'top' | 'bottom' | null = null;
  editingItemData: any = null;
  qrCodeUrl: string = '';
  popupImageUrl: string = '';
  showImagePopup = false;

  constructor(
    private orderService: OrderServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = Number(params['id']);
      this.loadOrderDetails();
    });
  }

  get totalItemCount(): number {
    return (this.order.tops?.length || 0) + (this.order.bottoms?.length || 0);
  }

  isOverdue(): boolean {
    if (!this.order?.order?.deliverydate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delivery = new Date(this.order.order.deliverydate);
    delivery.setHours(0, 0, 0, 0);
    const status = Number(this.order.order.orderstatus);
    return (status === 1 || status === 2) && delivery < today;
  }

  getStatusText(status: number): string {
    if (status === 1) return 'Active';
    if (status === 2) return 'Completed';
    if (status === 3) return 'Delivered';
    return 'Unknown';
  }

  getStatusClass(status: number): string {
    if (status === 1) return 's-active';
    if (status === 2) return 's-completed';
    if (status === 3) return 's-delivered';
    return '';
  }

  getCustomerInitials(): string {
    const name = this.order?.order?.customer || '';
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  loadOrderDetails() {
    this.loading = true;
    this.orderService.getOrderDetailsById(this.orderId).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.order = response.responseObject;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading order details:', error);
        this.loading = false;
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.originalOrder = JSON.parse(JSON.stringify(this.order));
    }
  }

  cancelEdit() {
    if (this.originalOrder) {
      this.order = JSON.parse(JSON.stringify(this.originalOrder));
    }
    this.isEditing = false;
  }

  openItemPopup() {
    this.editingItemType = null;
    this.editingItemData = null;
    this.showItemDialog = true;
  }

  closeItemDialog() {
    this.showItemDialog = false;
    this.editingItemType = null;
    this.editingItemData = null;
  }

  editItem(type: 'top' | 'bottom', index: number) {
    this.editingItemType = type;
    this.editingItemData = type === 'top' ?
      { ...this.order.tops[index] } :
      { ...this.order.bottoms[index] };
    this.editingItemData._index = index;
    this.showItemDialog = true;
  }

  deleteItem(type: string, index: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      if (type === 'top') {
        this.order.tops.splice(index, 1);
      } else {
        this.order.bottoms.splice(index, 1);
      }
      this.order.order.totalprice = this.calculateTotalPrice();
    }
  }

  onItemSaved(event: any) {
    const index = this.editingItemData?._index;
    const itemType = event.type || this.editingItemType;

    if (itemType === 'top') {
      if (index !== undefined) {
        const itemToUpdate = { ...event.item };
        delete itemToUpdate._index;
        this.order.tops[index] = itemToUpdate;
      } else {
        const newItem = { ...event.item };
        delete newItem._index;
        this.order.tops.push(newItem);
      }
    } else {
      if (index !== undefined) {
        const itemToUpdate = { ...event.item };
        delete itemToUpdate._index;
        this.order.bottoms[index] = itemToUpdate;
      } else {
        const newItem = { ...event.item };
        delete newItem._index;
        this.order.bottoms.push(newItem);
      }
    }

    this.order.order.totalprice = this.calculateTotalPrice();
    this.closeItemDialog();
  }

  calculateTotalPrice(): number {
    const topsTotal = this.order.tops.reduce((sum, item) => sum + (item.price || 0), 0);
    const bottomsTotal = this.order.bottoms.reduce((sum, item) => sum + (item.price || 0), 0);
    return topsTotal + bottomsTotal;
  }

  completeOrder() {
    this.orderService.completeOrder(this.orderId).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.loadOrderDetails();
        }
      },
      error: (error: any) => {
        console.error('Error completing order:', error);
      }
    });
  }

  goBack() {
    this.router.navigateByUrl('/customer-manager/order');
  }

  saveChanges() {
    this.orderService.updateOrder(this.order).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.isEditing = false;
          this.originalOrder = JSON.parse(JSON.stringify(this.order));
          alert('Order updated successfully!');
        } else {
          alert('Error updating order. Please try again.');
        }
      },
      error: (error: any) => {
        console.error('Error updating order:', error);
        alert('An unexpected error occurred. Please try again later.');
      }
    });
  }

  updateOrderStatus(newStatus: number) {
    this.order.order.orderstatus = newStatus;
    this.saveChanges();
  }

  askForWhatsAppAndUpdateStatus() {
    this.showWhatsAppDialog = true;
  }

  closeWhatsAppDialog(sendMessage: boolean) {
    this.showWhatsAppDialog = false;
    if (sendMessage) {
      this.sendWhatsAppMessage();
    }
    this.updateOrderStatus(3);
  }

  showQRCode() {
    const upiLink = `upi://pay?pa=vijaygohel202@oksbi&pn=vijay gohelk&am=${this.order.order.totalprice}&cu=INR`;
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(upiLink)}`;
    this.showQRDialog = true;
  }

  closeQRDialog() {
    this.showQRDialog = false;
  }

  printItem(item: TopItem | BottomItem) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const itemFields: { label: string; value: any }[] = [];
      if (isTopItem(item)) {
        Object.entries(item).forEach(([key, value]) => {
          if (value !== null && value !== 0 && value !== '' && key !== 'clothimage' && key !== 'designimage' && key !== 'price') {
            if (key === 'frontneckdesign') {
              itemFields.push({ label: 'FNeck', value });
            } else if (key === 'backneckdesign') {
              itemFields.push({ label: 'BNeck', value });
            } else {
              itemFields.push({ label: key.charAt(0).toUpperCase() + key.slice(1), value });
            }
          }
        });
      } else if (isBottomItem(item)) {
        Object.entries(item).forEach(([key, value]) => {
          if (value !== null && value !== 0 && value !== '' && key !== 'designimage' && key !== 'price') {
            itemFields.push({ label: key.charAt(0).toUpperCase() + key.slice(1), value });
          }
        });
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Item</title>
            <style>
              body {
                font-family: monospace;
                font-size: 16px;
                font-weight: bold;
                padding: 8px;
                margin: 0;
                color: black;
              }
               .customer-name {
                  text-align: start;
                  font-size: 18px;
                  margin-bottom: 8px;
                }
              .separator {
                border-top: 1px solid black;
                margin: 4px 0;
              }
              pre {
                white-space: pre-line;
                margin: 0;
                letter-spacing: -0.5px;
              }
            </style>
          </head>
          <body>
            <div class="customer-name">${this.order.order.customer}</div>
            <div class="separator"></div>
            <pre>${itemFields.map(field => `${field.label}: ${field.value}`).join('\n')}</pre>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert('Please allow popups for this website to print items.');
    }
  }

  async sendWhatsAppMessage() {
    const phoneNumber = (this.order.order.phonenumber || '').toString().replace(/[^0-9]/g, '');

    let message = ' *PERFECT DESIGNER HUB* \n\n';
    message += '*Order Details*\n';
    message += '----------------------------\n\n';

    message += '```Item Name         Price```\n';
    message += '```-----------------------```\n';

    this.order.tops.forEach(item => {
      const itemName = `${item.item}`.padEnd(15, ' ');
      message += '```' + itemName + ' ₹' + (item.price || 0).toString().padStart(6, ' ') + '```\n';
    });

    this.order.bottoms.forEach(item => {
      const itemName = `${item.item}`.padEnd(15, ' ');
      message += '```' + itemName + ' ₹' + (item.price || 0).toString().padStart(6, ' ') + '```\n';
    });

    message += '```-----------------------```\n';
    message += '```Total           ₹' + (this.order.order.totalprice || 0).toString().padStart(6, ' ') + '```\n\n';

    try {
      const response: any = await this.orderService.getTinyUrl(this.order.order.totalprice.toString()).toPromise();
      if (response && response.isSuccess) {
        message += '```Pay Here: ' + response.responseObject + '```\n\n';
      }
    } catch (e) {
      console.warn('TinyURL fetch failed, proceeding without it', e);
    }

    message += '_Thank you for shopping at_\n';
    message += '*PERFECT DESIGNER HUB*\n';
    message += 'Visit us again soon! ';

    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
    const webWhatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    window.open(webWhatsappUrl, '_blank');
  }

  downloadPdf(orderId: number): void {
    const id = orderId || this.orderId;
    this.orderService.downloadPdf(id);
  }

  openImagePopup(imageUrl: string): void {
    this.popupImageUrl = imageUrl;
    this.showImagePopup = true;
  }

  closeImagePopup(): void {
    this.showImagePopup = false;
    this.popupImageUrl = '';
  }
}

function isTopItem(item: TopItem | BottomItem): item is TopItem {
  return (item as TopItem).item !== undefined;
}

function isBottomItem(item: TopItem | BottomItem): item is BottomItem {
  return (item as BottomItem).item !== undefined;
}
