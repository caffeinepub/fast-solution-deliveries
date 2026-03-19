export type Screen =
  | "splash"
  | "role"
  | "auth"
  | "customer-home"
  | "booking-confirm"
  | "order-tracking"
  | "order-history"
  | "rider-dashboard"
  | "rider-order"
  | "profile";

export type Role = "customer" | "rider";

export interface AppUser {
  role: Role;
  name: string;
  email: string;
  phone: string;
  aadhaar?: string;
  pan?: string;
}

export type DeliveryType = "walking" | "bike" | "metro" | "bus";

export interface BookingData {
  orderId: string;
  city: string;
  pickup: string;
  drop: string;
  description: string;
  weight: number;
  distance: number;
  deliveryType: DeliveryType;
  price: number;
  status: "placed" | "assigned" | "picked" | "transit" | "delivered";
  riderName: string;
  riderPhone: string;
}
