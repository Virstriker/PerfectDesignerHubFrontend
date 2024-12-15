import { Component, OnInit } from '@angular/core';
import { Order, TopItem, BottomItem, addOrderDto, getOrderDto } from '../../interfaces/order';
import { ResponseDto } from '../../interfaces/customer';
import { OrderServiceService } from '../../services/order-service.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AddItemDialogComponent } from '../add-order/add-item-dialog/add-item-dialog.component';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [NgFor, NgIf, CommonModule, FormsModule, RouterModule, HttpClientModule, AddItemDialogComponent],
  providers: [OrderServiceService],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: getOrderDto = {
    order: {
      customerid: 0,
      customer: '1',
      branchname: '',
      orderdate: '',
      deliverydate: '',
      totalprice: 0,
      orderstatus: 0,
      phonenumber: 0
    },
    tops: [],
    bottoms: []
  };
  
  orderId!: number;
  isEditing = false;
  originalOrder: addOrderDto | null = null;
  showItemDialog = false;
  showWhatsAppDialog = false;
  showQRDialog = false;
  editingItemType: 'top' | 'bottom' | null = null; 
  editingItemData: any = null;
  qrCodeUrl: string = '';

  constructor(
    private orderService: OrderServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      this.loadOrderDetails();
    });
  }

  loadOrderDetails() {
    this.orderService.getOrderDetailsById(this.orderId).subscribe({
      next: (response: ResponseDto) => {
        if (response.isSuccess) {
          this.order = response.responseObject;
        }
      },
      error: (error: any) => { 
        console.error('Error loading order details:', error);
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
    // Create a deep copy of the item
    this.editingItemData = type === 'top' ? 
      { ...this.order.tops[index] } : 
      { ...this.order.bottoms[index] };
    this.editingItemData._index = index; // Store the index for reference
    this.showItemDialog = true;
  }

  deleteItem(type: string, index: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      if (type === 'top') {
        this.order.tops.splice(index, 1);
      } else {
        this.order.bottoms.splice(index, 1);
      }
    }
  }

  onItemSaved(event: any) {
    const index = this.editingItemData?._index;
    
    if (this.editingItemType === 'top') {
      if (index !== undefined) {
        // Update existing item
        const itemToUpdate = { ...event.item };
        delete itemToUpdate._index; // Remove _index before saving
        this.order.tops[index] = itemToUpdate;
      } else {
        // Add new item
        const newItem = { ...event.item };
        delete newItem._index; // Remove _index before saving
        this.order.tops.push(newItem);
      }
    } else {
      if (index !== undefined) {
        // Update existing item
        const itemToUpdate = { ...event.item };
        delete itemToUpdate._index; // Remove _index before saving
        this.order.bottoms[index] = itemToUpdate;
      } else {
        // Add new item
        const newItem = { ...event.item };
        delete newItem._index; // Remove _index before saving
        this.order.bottoms.push(newItem);
      }
    }
    
    // Recalculate total price
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

  generateBillPdf() {
    // Implement PDF generation
  }

  goBack() {
    window.history.back();
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
              itemFields.push({ label: 'FNeckDesign', value });
            }else if (key === 'backneckdesign') {
              itemFields.push({ label: 'BNeckDesign', value });
            }
             else {
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
                  text-align: center;
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
    const phoneNumber = this.order.order.phonenumber.toString().replace(/[^0-9]/g, '');
    
    // Create a table-like structure using monospace font and proper spacing
    let message = ' *PERFECT DESIGNER HUB* \n\n';
    message += '*Order Details*\n';
    message += '----------------------------\n\n';
    
    // Add header for items table
    message += '```Item Name         Price```\n';
    message += '```-----------------------```\n';
    
    // Add top items
    this.order.tops.forEach(item => {
      const itemName = `${item.item}`.padEnd(15, ' '); // Make item name bold and pad to 15 characters
      message += '```' + itemName + ' ₹' + item.price.toString().padStart(6, ' ') + '```\n';
    });
    
    // Add bottom items
    this.order.bottoms.forEach(item => {
      const itemName = `${item.item}`.padEnd(15, ' '); // Make item name bold and pad to 15 characters
      message += '```' + itemName + ' ₹' + item.price.toString().padStart(6, ' ') + '```\n';
    });
    
    // Add separator and total
    message += '```-----------------------```\n';
    message += '```Total           ₹' + this.order.order.totalprice.toString().padStart(6, ' ') + '```\n\n';
    var upi = 
    await this.orderService.getTinyUrl(this.order.order.totalprice.toString()).toPromise().then((response: ResponseDto) => {
        if (response.isSuccess) {
          message += '```Pay Here: ' + response.responseObject + '```\n\n';
        }
    })
    // Add footer
    message += '_Thank you for shopping at_\n';
    message += '*PERFECT DESIGNER HUB*\n';
    message += 'Visit us again soon! ';
    
    // Format phone number (remove any non-numeric characters and add country code if needed)
    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
    
    // Open in web WhatsApp
    const webWhatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    window.open(webWhatsappUrl, '_blank');
  }

}

function isTopItem(item: TopItem | BottomItem): item is TopItem {
  return (item as TopItem).item !== undefined;
}

function isBottomItem(item: TopItem | BottomItem): item is BottomItem {
  return (item as BottomItem).item !== undefined;
}
