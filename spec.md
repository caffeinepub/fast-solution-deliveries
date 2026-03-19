# Fast Solution Deliveries

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Splash screen with app logo and name
- Dual-role selection screen (Customer / Rider)
- Sign-up flow for both roles: full name, email, phone, OTP verification
- Rider-specific sign-up: Aadhaar and PAN number fields with verification status badges
- Customer flow: pickup/drop location entry, parcel details, delivery type selection, dynamic pricing, booking confirmation with order ID, order tracking screen, order history
- Rider flow: delivery mode selection, online/offline toggle dashboard, incoming order accept/reject, map navigation UI, earnings summary, rider disclaimer
- 4 delivery types: Walking (≤1 km, ₹20–₹40), Bike (1–60 km, ₹50–₹150), Metro (station-to-station, ₹40–₹120), Bus (stop-to-stop, ₹60–₹180)
- Dynamic price calculator based on distance, delivery type, and parcel weight
- Simulated real-time map UI (Google Maps style) for tracking and navigation
- Cities served: Delhi, Noida, Gurugram, Ghaziabad, Faridabad, Sonipat, Rohtak, Meerut, Bahadurgarh
- Orange and white primary color scheme
- Mobile-first responsive design

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan

### Backend (Motoko)
- User management: store profiles for customers and riders with role, name, email, phone, OTP (simulated), and verification status
- Order management: create, update, and query orders with status lifecycle (pending → accepted → in_transit → delivered)
- Rider management: toggle online/offline, accept/reject orders, track earnings
- Delivery type config: store pricing rules and distance constraints
- Order history queries per user

### Frontend (React + TypeScript)
1. SplashScreen – animated logo, app name
2. RoleSelectionScreen – Customer / Rider cards
3. AuthScreen – sign-up/login form, OTP step; rider adds Aadhaar + PAN fields
4. CustomerHome – location entry (pickup/drop), parcel details, delivery type selector with pricing preview
5. PriceCalculator – dynamic fare breakdown panel
6. BookingConfirmation – order ID, summary, estimated time
7. OrderTracking – simulated map with rider pin, status timeline
8. OrderHistory – list of past orders with status badges
9. RiderDashboard – online/offline toggle, incoming order cards, earnings summary
10. RiderOrderDetail – accept/reject UI, navigation map
11. Shared components: VerificationBadge, DeliveryTypeCard, MapPlaceholder
