import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import type { AppUser, BookingData, Screen } from "../types";

const MOCK_ORDERS: BookingData[] = [
  {
    orderId: "FSD-501234",
    city: "Delhi",
    pickup: "Karol Bagh Metro Station",
    drop: "Rajouri Garden",
    description: "Medicines",
    weight: 1,
    parcelCount: 1,
    distance: 4.2,
    deliveryType: "bike",
    deliverySpeed: "fast",
    price: 65,
    baseCharge: 60,
    weightSurcharge: 0,
    timeSurcharge: 0,
    fastCharge: 5,
    status: "placed",
    riderName: "",
    riderPhone: "",
  },
  {
    orderId: "FSD-501235",
    city: "Noida",
    pickup: "Sector 18 Bus Stop",
    drop: "Sector 62 Bus Stop",
    description: "Documents",
    weight: 0.5,
    parcelCount: 1,
    distance: 9,
    deliveryType: "bus",
    deliverySpeed: "slow",
    price: 55,
    baseCharge: 55,
    weightSurcharge: 0,
    timeSurcharge: 0,
    fastCharge: 0,
    status: "placed",
    riderName: "",
    riderPhone: "",
  },
  {
    orderId: "FSD-501236",
    city: "Gurugram",
    pickup: "MG Road Metro",
    drop: "IFFCO Chowk Metro",
    description: "Books",
    weight: 6,
    parcelCount: 1,
    distance: 3.1,
    deliveryType: "metro",
    deliverySpeed: "slow",
    price: 45,
    baseCharge: 40,
    weightSurcharge: 5,
    timeSurcharge: 0,
    fastCharge: 0,
    status: "placed",
    riderName: "",
    riderPhone: "",
  },
  {
    orderId: "FSD-501237",
    city: "Delhi",
    pickup: "Lajpat Nagar",
    drop: "Saket",
    description: "Bulk files",
    weight: 3,
    parcelCount: 5,
    distance: 5.5,
    deliveryType: "courier",
    courierSubType: "bulk",
    deliverySpeed: "slow",
    price: 85,
    baseCharge: 85,
    weightSurcharge: 0,
    timeSurcharge: 0,
    fastCharge: 0,
    status: "placed",
    riderName: "",
    riderPhone: "",
  },
];

const DELIVERY_ICONS: Record<string, string> = {
  walking: "🚶",
  bike: "🏍️",
  metro: "🚇",
  bus: "🚌",
  courier: "📦",
};

// 90% rider share
const riderShare = (amount: number) => Math.round(amount * 0.9);

interface Props {
  user: AppUser;
  onOrderSelect: (b: BookingData) => void;
  onNav: (s: Screen) => void;
}

export default function RiderDashboard({ user, onOrderSelect, onNav }: Props) {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingOrders, setPendingOrders] =
    useState<BookingData[]>(MOCK_ORDERS);

  const serviceLabel =
    user.riderVehicleType === "two-wheeler"
      ? "🏍️ 2-Wheeler Rider"
      : user.riderServicePreference
        ? `${DELIVERY_ICONS[user.riderServicePreference]} ${user.riderServicePreference.charAt(0).toUpperCase() + user.riderServicePreference.slice(1)} Rider`
        : "🚶 Walker/Transit Rider";

  const handleAccept = (order: BookingData) => {
    toast.success(`Order ${order.orderId} accepted!`);
    onOrderSelect({ ...order, riderName: user.name, riderPhone: user.phone });
  };

  const handleReject = (orderId: string) => {
    setPendingOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    toast.info("Order rejected");
  };

  // Earnings (90% rider share)
  const earnings = [
    { label: "Today", gross: 480, share: riderShare(480) },
    { label: "This Week", gross: 2840, share: riderShare(2840) },
    { label: "Total", gross: 48250, share: riderShare(48250) },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div
        className="px-4 pt-10 pb-6 text-white"
        style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)" }}
      >
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm">Welcome back,</p>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.aadhaar && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                    ✓ Aadhaar Verified
                  </span>
                )}
                {user.pan && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                    ✓ PAN Verified
                  </span>
                )}
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                  {serviceLabel}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm">
                  {isOnline ? "Online" : "Offline"}
                </span>
                <Switch
                  data-ocid="rider.online.toggle"
                  checked={isOnline}
                  onCheckedChange={(v) => {
                    setIsOnline(v);
                    toast.success(
                      v ? "You are now online!" : "You are now offline",
                    );
                  }}
                />
              </div>
              {isOnline && (
                <span className="text-xs bg-green-400 text-white px-2 py-0.5 rounded-full">
                  ● Live
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 flex flex-col gap-5">
        {/* Earnings with 90/10 split */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-sm">Your Earnings</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(255,107,0,0.1)", color: "#FF6B00" }}
            >
              90% your share · 10% FSD
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {earnings.map((e) => (
              <div
                key={e.label}
                className="bg-card border border-border rounded-2xl p-3 text-center"
              >
                <p className="font-bold text-lg" style={{ color: "#FF6B00" }}>
                  ₹{e.share.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {e.label}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  of ₹{e.gross.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💡 You earn 90% of each delivery fee. FSD retains 10% as commission.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">Incoming Orders</p>
            {!isOnline && (
              <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                Go online to receive
              </Badge>
            )}
          </div>

          {!isOnline ? (
            <div
              data-ocid="rider.empty_state"
              className="text-center py-10 text-muted-foreground bg-muted/50 rounded-2xl"
            >
              <div className="text-4xl mb-3">🔌</div>
              <p className="text-sm">Toggle online to start receiving orders</p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-muted/50 rounded-2xl">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-sm">Waiting for orders...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingOrders.map((order, i) => (
                <motion.div
                  key={order.orderId}
                  data-ocid={`rider.item.${i + 1}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">
                      {order.orderId}
                    </span>
                    <div className="flex items-center gap-1">
                      {order.deliverySpeed === "fast" && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                          ⚡ Fast
                        </span>
                      )}
                      <span className="text-lg">
                        {DELIVERY_ICONS[order.deliveryType]}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    📍 {order.pickup}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    🎯 {order.drop}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground">
                      {order.distance} km · {order.weight} kg
                      {order.parcelCount > 1 &&
                        ` · ${order.parcelCount} parcels`}
                      {order.courierSubType &&
                        ` · ${order.courierSubType} courier`}
                    </span>
                    <div className="text-right">
                      <span className="font-bold" style={{ color: "#FF6B00" }}>
                        ₹{riderShare(order.price)}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        your 90%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-ocid={`rider.accept_button.${i + 1}`}
                      onClick={() => handleAccept(order)}
                      size="sm"
                      className="flex-1 rounded-full text-white"
                      style={{
                        background: "linear-gradient(90deg, #FF6B00, #FF9500)",
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      data-ocid={`rider.reject_button.${i + 1}`}
                      onClick={() => handleReject(order.orderId)}
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-full"
                    >
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav
        userRole="rider"
        activeScreen="rider-dashboard"
        onNav={onNav}
      />
    </div>
  );
}
