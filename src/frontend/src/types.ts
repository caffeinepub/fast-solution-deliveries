export type Screen =
  | "splash"
  | "role"
  | "auth"
  | "customer-home"
  | "payment"
  | "booking-confirm"
  | "order-tracking"
  | "order-history"
  | "rider-dashboard"
  | "rider-order"
  | "profile"
  | "reviews";

export type Role = "customer" | "rider";

export interface AppUser {
  role: Role;
  name: string;
  email: string;
  phone: string;
  aadhaar?: string;
  pan?: string;
  riderVehicleType?: "two-wheeler" | "none";
  riderServicePreference?: "metro" | "walking" | "bus";
}

export type DeliveryType = "walking" | "bike" | "metro" | "bus" | "courier";
export type CourierSubType = "normal" | "bulk";
export type DeliverySpeed = "slow" | "fast";

export interface ParcelLeg {
  parcelNo: number;
  pickup: string;
  drop: string;
  distance: number;
}

export interface BookingData {
  orderId: string;
  city: string;
  pickup: string;
  drop: string;
  description: string;
  weight: number;
  parcelCount: number;
  distance: number;
  deliveryType: DeliveryType;
  courierSubType?: CourierSubType;
  deliverySpeed: DeliverySpeed;
  price: number;
  baseCharge: number;
  weightSurcharge: number;
  timeSurcharge: number;
  fastCharge: number;
  couponCode?: string;
  discount?: number;
  status: "placed" | "assigned" | "picked" | "transit" | "delivered";
  riderName: string;
  riderPhone: string;
  parcelLegs?: ParcelLeg[];
}

export interface Review {
  id: string;
  orderId: string;
  reviewerRole: "customer" | "rider";
  reviewerName: string;
  targetName: string;
  rating: number;
  comment: string;
  date: string;
  deliveryType: string;
}
