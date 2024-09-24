export interface Customer {
    id:number;
    name: string;
    phonenumber: string;
    surname: string;
    address:string;
  }

  export interface CustomerAdd {
    Id:number|null;
    Name: string;
    Phonenumber: string;
    Surname: string;
    Address:string;
  }


 export interface CustomerDetail {
    name: string;
    surname: string;
    phoneNumber: string;
    address: string;
  }
  
  export interface OrderCard {
    branchname: string;
  customer: string;
  deliverydate: string;
  id: number;
  orderdate: string;
  orderstatus: boolean;
  ordertables: string;
   totalPrice:number;
  }

  export interface LoginDto {
    userid?: string;
    userpassword?: string;
}
export interface ResponseDto {
  isSuccess: boolean;
  message: string;
  responseObject?: any; 
}
// Define an interface for each item type
export interface Blouse {
  id: number;
  ordertableid: number;
  style: string;
  neckdesign: string;
  astar: boolean;
  openingside: string;
  neck: string;
  dori: boolean;
  sleeve: string;
  detail: string;
  clothimage: string;
  desingimage: string;
  price: number;
}

export interface Dress {
  id: number;
  ordertableid: number;
  style: string;
  neckdesign: string;
  astar: boolean;
  openingside: string;
  backofneck: string;
  chain: boolean;
  sleeve: string;
  detail: string;
  clothimage: string;
  desingimage: string;
  price: number;
}

export interface Chaniyo {
  id: number;
  ordertableid: number;
  style: string;
  detail: string;
  clothimage: string;
  desingimage: string;
  price: number;
}

export interface Pant {
  id: number;
  ordertableid: number;
  rubbert: string;
  neckdesign: string;
  pocket: boolean;
  detail: string;
  price: number;
}

// Define an interface for the order itself
export interface OrderDetails {
  orderDto:OrderCard;
  blouses: Blouse[];
  dresses: Dress[];
  chaniyo: Chaniyo[];
  pants: Pant[];
}