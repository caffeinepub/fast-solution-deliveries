import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
    distance: 4.2,
    deliveryType: "bike",
    price: 60,
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
    distance: 9,
    deliveryType: "bus",
    price: 78,
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
    weight: 2.5,
    distance: 3.1,
    deliveryType: "metro",
    price: 71,
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
};

interface Props {
  user: AppUser;
  onOrderSelect: (b: BookingData) => void;
  onNav: (s: Screen) => void;
}

export default function RiderDashboard({ user, onOrderSelect, onNav }: Props) {
  const [isOnline, setIsOnline] = useState(false);
  const [mode, setMode] = useState<"bike" | "walking" | "metro" | "bus">(
    "bike",
  );
  const [pendingOrders, setPendingOrders] =
    useState<BookingData[]>(MOCK_ORDERS);

  const handleAccept = (order: BookingData) => {
    toast.success(`Order ${order.orderId} accepted!`);
    onOrderSelect({ ...order, riderName: user.name, riderPhone: user.phone });
  };

  const handleReject = (orderId: string) => {
    setPendingOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    toast.info("Order rejected");
  };

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
              <div className="flex gap-2 mt-2">
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
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Today", amount: "₹480" },
            { label: "This Week", amount: "₹2,840" },
            { label: "Total", amount: "₹48,250" },
          ].map((e) => (
            <div
              key={e.label}
              className="bg-card border border-border rounded-2xl p-3 text-center"
            >
              <p className="font-bold text-lg" style={{ color: "#FF6B00" }}>
                {e.amount}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{e.label}</p>
            </div>
          ))}
        </div>

        <div>
          <Label className="text-sm font-semibold">Delivery Mode</Label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {(["bike", "walking", "metro", "bus"] as const).map((m) => (
              <button
                type="button"
                key={m}
                data-ocid={`rider.mode_${m}.button`}
                onClick={() => setMode(m)}
                className={`p-2 rounded-xl border-2 text-center transition-all ${
                  mode === m
                    ? "border-orange-500 bg-orange-50"
                    : "border-border bg-card"
                }`}
              >
                <div className="text-xl">{DELIVERY_ICONS[m]}</div>
                <p className="text-xs capitalize mt-1">{m}</p>
              </button>
            ))}
          </div>
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
                    <span className="text-lg">
                      {DELIVERY_ICONS[order.deliveryType]}
                    </span>
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
                    </span>
                    <span className="font-bold" style={{ color: "#FF6B00" }}>
                      ₹{order.price}
                    </span>
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
