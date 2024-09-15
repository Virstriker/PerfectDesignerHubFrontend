export interface Customer {
    id:number;
    name: string;
    number: string;
  }

 export interface CustomerDetail {
    name: string;
    surname: string;
    phoneNumber: string;
    address: string;
  }
  
  export interface OrderCard {
    orderNumber: number;
    status: string;
    startDate: Date;
    endDate: Date;
  }