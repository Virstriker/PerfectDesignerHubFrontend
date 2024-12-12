export interface Order {
    customerid: number;
    branchname: string;
    orderdate: string;
    deliverydate: string;
    totalprice: number;
    orderstatus: number;
}

export interface TopItem {
    item: string;
    style: string;
    frontneckdesign: string;
    backneckdesign: string;
    astar: boolean;
    openingside: string;
    inneck: string;
    backofneck: string;
    dori: boolean;
    sleeve: string;
    detail: string;
    clothimage?: string;
    designimage?: string;
    price: number;
}

export interface BottomItem {
    item: string;
    style: string;
    rubber: string;
    pocket: boolean;
    detail: string;
    designimage?: string;
    price: number;
}

export interface addOrderDto {
    order: Order;
    tops: TopItem[];
    bottoms: BottomItem[];
}