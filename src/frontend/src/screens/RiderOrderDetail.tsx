import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import SimulatedMap from "../components/SimulatedMap";
import type { AppUser, BookingData, Screen } from "../types";

const NEXT_STATUS: Record<string, string> = {
  placed: "assigned",
  assigned: "picked",
  picked: "transit",
  transit: "delivered",
};

const STATUS_ACTIONS: Record<string, string> = {
  placed: "Start Pickup",
  assigned: "Confirm Pickup",
  picked: "Start Delivery",
  transit: "Mark Delivered",
};

interface Props {
  order: BookingData;
  user: AppUser;
  onBack: () => void;
  onNav: (s: Screen) => void;
}

export default function RiderOrderDetail({
  order,
  user: _user,
  onBack,
  onNav,
}: Props) {
  const [status, setStatus] = useState(order.status);

  const handleAdvance = () => {
    const next = NEXT_STATUS[status];
    if (next) {
      setStatus(next as BookingData["status"]);
      toast.success(`Status updated to ${next}`);
      if (next === "delivered") {
        toast.success("🎉 Order completed! Great work!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground"
          >
            ←
          </button>
          <div>
            <h2 className="font-bold">Order Detail</h2>
            <p className="text-xs text-muted-foreground">{order.orderId}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 flex flex-col gap-5">
        <SimulatedMap />

        <div
          className="rounded-2xl p-4 text-white text-center"
          style={{ background: "linear-gradient(90deg, #FF6B00, #FF9500)" }}
        >
          <p className="text-sm font-medium opacity-80">Current Status</p>
          <p className="text-xl font-bold capitalize mt-1">
            {status.replace("transit", "In Transit")}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 text-sm flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5">●</span>
            <div>
              <p className="text-xs text-muted-foreground">PICKUP</p>
              <p className="font-medium">{order.pickup}</p>
            </div>
          </div>
          <div className="border-t border-border" />
          <div className="flex items-start gap-3">
            <span className="text-red-500 mt-0.5">●</span>
            <div>
              <p className="text-xs text-muted-foreground">DROP</p>
              <p className="font-medium">{order.drop}</p>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Parcel</span>
              <span>{order.description}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Weight</span>
              <span>{order.weight} kg</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Distance</span>
              <span>{order.distance} km</span>
            </div>
            <div className="flex justify-between mt-1 font-bold">
              <span>Earnings</span>
              <span style={{ color: "#FF6B00" }}>₹{order.price}</span>
            </div>
          </div>
        </div>

        {status !== "delivered" ? (
          <Button
            data-ocid="rider_order.advance.button"
            onClick={handleAdvance}
            className="w-full rounded-full text-white font-bold py-5"
            style={{ background: "linear-gradient(90deg, #FF6B00, #FF9500)" }}
          >
            {STATUS_ACTIONS[status]}
          </Button>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-green-600">
              Order Delivered Successfully!
            </p>
            <Button
              data-ocid="rider_order.back.button"
              onClick={onBack}
              variant="outline"
              className="mt-4 rounded-full"
            >
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>

      <BottomNav userRole="rider" activeScreen="rider-order" onNav={onNav} />
    </div>
  );
}
