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
  riderVehicleType?: "two-wheeler" | "none";
  riderServicePreference?: "metro" | "walking" | "bus";
}

export type DeliveryType = "walking" | "bike" | "metro" | "bus" | "courier";
export type CourierSubType = "normal" | "bulk";
export type DeliverySpeed = "slow" | "fast";

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
  status: "placed" | "assigned" | "picked" | "transit" | "delivered";
  riderName: string;
  riderPhone: string;
}
