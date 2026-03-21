import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import CallOverlay from "../components/CallOverlay";
import ChatPanel from "../components/ChatPanel";
import ReviewModal from "../components/ReviewModal";
import SimulatedMap from "../components/SimulatedMap";
import type { AppUser, BookingData, Review, Screen } from "../types";

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
  onReviewSubmit?: (review: Review) => void;
}

export default function RiderOrderDetail({
  order,
  user,
  onBack,
  onNav,
  onReviewSubmit,
}: Props) {
  const [status, setStatus] = useState(order.status);
  const [showReview, setShowReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);

  const customerName = `Customer (${order.orderId.slice(-4)})`;

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

  const handleReviewSubmit = (review: Review) => {
    onReviewSubmit?.(review);
    setShowReview(false);
    setReviewDone(true);
    toast.success("Thanks for your feedback! ⭐");
    setTimeout(() => onBack(), 1200);
  };

  const handleSkip = () => {
    setShowReview(false);
    setReviewDone(true);
    toast("Review skipped");
    setTimeout(() => onBack(), 800);
  };

  const hasMultiLegs = order.parcelLegs && order.parcelLegs.length > 1;

  const routeStops: string[] = [];
  if (hasMultiLegs && order.parcelLegs) {
    for (let i = 0; i < order.parcelLegs.length; i++) {
      if (i === 0) routeStops.push(order.parcelLegs[i].pickup);
      routeStops.push(order.parcelLegs[i].drop);
    }
  }

  const isDelivered = status === "delivered";

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

        {/* Customer contact card with Call + Message */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
              }}
            >
              C
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{customerName}</p>
              <p className="text-xs text-muted-foreground">Customer</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-ocid="rider_order.chat.open_modal_button"
                onClick={() => setShowChat(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-background hover:bg-muted transition-colors"
                title="Message Customer"
              >
                <MessageCircle size={18} className="text-orange-500" />
              </button>
              <button
                type="button"
                data-ocid="rider_order.call.primary_button"
                onClick={() => setShowCall(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                }}
                title="Call Customer"
              >
                <Phone size={18} />
              </button>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 text-white text-center"
          style={{ background: "linear-gradient(90deg, #FF6B00, #FF9500)" }}
        >
          <p className="text-sm font-medium opacity-80">Current Status</p>
          <p className="text-xl font-bold capitalize mt-1">
            {status.replace("transit", "In Transit")}
          </p>
        </div>

        {hasMultiLegs && order.parcelLegs ? (
          <div
            className="bg-card border border-border rounded-2xl p-4 text-sm"
            style={{ borderLeft: "4px solid #FF6B00" }}
          >
            <p className="text-xs font-semibold text-orange-600 mb-3">
              🗺️ Multi-Stop Delivery Route
            </p>
            <div className="flex flex-col gap-2">
              {order.parcelLegs.map((leg, i) => (
                <div key={leg.parcelNo}>
                  <div className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5"
                      style={{ background: "#FF6B00", fontSize: "10px" }}
                    >
                      {leg.parcelNo}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-green-500 text-xs">●</span>
                        <p className="text-xs text-muted-foreground">PICKUP</p>
                      </div>
                      <p className="font-medium text-sm">{leg.pickup}</p>
                      <div className="ml-1 border-l-2 border-dashed border-muted h-3 my-1" />
                      <div className="flex items-center gap-1">
                        <span className="text-red-500 text-xs">●</span>
                        <p className="text-xs text-muted-foreground">DROP</p>
                      </div>
                      <p className="font-medium text-sm">{leg.drop}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {leg.distance} km
                    </span>
                  </div>
                  {i < order.parcelLegs!.length - 1 && (
                    <div className="border-t border-dashed border-muted my-2" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex flex-wrap items-center gap-1">
                {routeStops.map((stop, i) => (
                  <span
                    key={stop + String(i)}
                    className="flex items-center gap-1"
                  >
                    <span className="text-xs font-medium text-foreground bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                      {stop}
                    </span>
                    {i < routeStops.length - 1 && (
                      <span className="text-orange-400 text-xs font-bold">
                        →
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
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
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-4 text-sm flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Parcel</span>
            <span>{order.description}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Weight</span>
            <span>{order.weight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Distance</span>
            <span>{order.distance} km</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Earnings</span>
            <span style={{ color: "#FF6B00" }}>₹{order.price}</span>
          </div>
        </div>

        {!isDelivered ? (
          <Button
            data-ocid="rider_order.advance.button"
            onClick={handleAdvance}
            className="w-full rounded-full text-white font-bold py-5"
            style={{ background: "linear-gradient(90deg, #FF6B00, #FF9500)" }}
          >
            {STATUS_ACTIONS[status]}
          </Button>
        ) : (
          <div className="text-center py-4 flex flex-col gap-3">
            <div className="text-4xl">🎉</div>
            <p className="font-bold text-green-600">
              Order Delivered Successfully!
            </p>

            {!reviewDone && (
              <button
                type="button"
                data-ocid="rider_order.rate.primary_button"
                onClick={() => setShowReview(true)}
                className="w-full text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
                style={{
                  background: "linear-gradient(90deg, #FF6B00, #FF9500)",
                }}
              >
                <span className="text-xl">⭐</span>
                Rate your Customer
              </button>
            )}

            {reviewDone && (
              <div
                className="text-center py-3 rounded-2xl bg-green-50 border border-green-200"
                data-ocid="rider_order.review.success_state"
              >
                <p className="text-green-700 font-semibold text-sm">
                  ✅ Thanks for your feedback!
                </p>
              </div>
            )}

            <Button
              data-ocid="rider_order.back.button"
              onClick={onBack}
              variant="outline"
              className="rounded-full"
            >
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>

      <BottomNav userRole="rider" activeScreen="rider-order" onNav={onNav} />

      <ReviewModal
        open={showReview}
        orderId={order.orderId}
        reviewerRole="rider"
        reviewerName={user.name}
        targetName={customerName}
        deliveryType={order.deliveryType}
        onSubmit={handleReviewSubmit}
        onSkip={handleSkip}
      />

      <ChatPanel
        open={showChat}
        onClose={() => setShowChat(false)}
        otherName={customerName}
        userRole="rider"
      />

      <CallOverlay
        open={showCall}
        onClose={() => setShowCall(false)}
        calleeName={customerName}
      />
    </div>
  );
}
