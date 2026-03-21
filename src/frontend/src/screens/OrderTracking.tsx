import { MessageCircle, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import CallOverlay from "../components/CallOverlay";
import ChatPanel from "../components/ChatPanel";
import ReviewModal from "../components/ReviewModal";
import SimulatedMap from "../components/SimulatedMap";
import type { AppUser, BookingData, Review, Screen } from "../types";

const STATUSES = [
  { key: "placed", label: "Order Placed", desc: "Your booking is confirmed" },
  {
    key: "assigned",
    label: "Rider Assigned",
    desc: "A rider is heading to you",
  },
  { key: "picked", label: "Picked Up", desc: "Parcel collected from pickup" },
  { key: "transit", label: "In Transit", desc: "On the way to destination" },
  {
    key: "delivered",
    label: "Delivered",
    desc: "Parcel delivered successfully",
  },
];

const STATUS_ORDER = ["placed", "assigned", "picked", "transit", "delivered"];

interface Props {
  booking: BookingData;
  onNav: (s: Screen) => void;
  user: AppUser;
  onReviewSubmit?: (review: Review) => void;
}

export default function OrderTracking({
  booking,
  onNav,
  user,
  onReviewSubmit,
}: Props) {
  const [currentStatus, setCurrentStatus] = useState(booking.status);
  const [showReview, setShowReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);

  useEffect(() => {
    const idx = STATUS_ORDER.indexOf(currentStatus);
    if (idx < STATUS_ORDER.length - 1) {
      const t = setTimeout(() => {
        setCurrentStatus(STATUS_ORDER[idx + 1] as BookingData["status"]);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [currentStatus]);

  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const isDelivered = currentStatus === "delivered";

  const handleReviewSubmit = (review: Review) => {
    onReviewSubmit?.(review);
    setShowReview(false);
    setReviewDone(true);
    toast.success("Thanks for your feedback! ⭐");
  };

  const handleSkip = () => {
    setShowReview(false);
    setReviewDone(true);
    toast("Review skipped");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNav("customer-home")}
            className="text-muted-foreground"
          >
            ←
          </button>
          <div>
            <h2 className="font-bold">Live Tracking</h2>
            <p className="text-xs text-muted-foreground">{booking.orderId}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 flex flex-col gap-5">
        <SimulatedMap />

        {/* Rider info card with Call + Message */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
              }}
            >
              {booking.riderName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{booking.riderName}</p>
              <p className="text-sm text-muted-foreground">
                {booking.riderPhone}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-ocid="order_tracking.chat.open_modal_button"
                onClick={() => setShowChat(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-background hover:bg-muted transition-colors"
                title="Message Rider"
              >
                <MessageCircle size={18} className="text-orange-500" />
              </button>
              <button
                type="button"
                data-ocid="order_tracking.call.primary_button"
                onClick={() => setShowCall(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                }}
                title="Call Rider"
              >
                <Phone size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-semibold mb-4">Delivery Status</p>
          <div className="flex flex-col gap-0">
            {STATUSES.map((s, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                        done ? "text-white" : "bg-muted text-muted-foreground"
                      }`}
                      style={
                        done
                          ? {
                              background:
                                "linear-gradient(135deg, #FF6B00, #FF9500)",
                            }
                          : {}
                      }
                    >
                      {done ? "✓" : "○"}
                    </div>
                    {i < STATUSES.length - 1 && (
                      <div
                        className="w-0.5 h-8 mt-1"
                        style={{
                          background:
                            done && i < currentIdx ? "#FF6B00" : "#e5e7eb",
                        }}
                      />
                    )}
                  </div>
                  <div className="pb-6">
                    <p
                      className={`font-medium text-sm ${active ? "" : done ? "" : "text-muted-foreground"}`}
                      style={active ? { color: "#FF6B00" } : {}}
                    >
                      {s.label}
                      {active && (
                        <span className="ml-2 text-xs status-blink">
                          ● Live
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 text-sm">
          <p className="font-semibold mb-3">Order Summary</p>
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">From</span>
            <span className="font-medium">{booking.pickup}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">To</span>
            <span className="font-medium">{booking.drop}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-bold" style={{ color: "#FF6B00" }}>
              ₹{booking.price}
            </span>
          </div>
        </div>

        {/* Rate Rider button after delivery */}
        {isDelivered && !reviewDone && (
          <motion.button
            type="button"
            data-ocid="order_tracking.rate.primary_button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowReview(true)}
            className="w-full text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{ background: "linear-gradient(90deg, #FF6B00, #FF9500)" }}
          >
            <span className="text-xl">⭐</span>
            Rate your Rider
          </motion.button>
        )}

        {isDelivered && reviewDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-3 rounded-2xl bg-green-50 border border-green-200"
            data-ocid="order_tracking.review.success_state"
          >
            <p className="text-green-700 font-semibold text-sm">
              ✅ Thanks for your feedback!
            </p>
          </motion.div>
        )}
      </div>

      <BottomNav
        userRole="customer"
        activeScreen="order-tracking"
        onNav={onNav}
      />

      <ReviewModal
        open={showReview}
        orderId={booking.orderId}
        reviewerRole="customer"
        reviewerName={user.name}
        targetName={booking.riderName}
        deliveryType={booking.deliveryType}
        onSubmit={handleReviewSubmit}
        onSkip={handleSkip}
      />

      <ChatPanel
        open={showChat}
        onClose={() => setShowChat(false)}
        otherName={booking.riderName}
        userRole="customer"
      />

      <CallOverlay
        open={showCall}
        onClose={() => setShowCall(false)}
        calleeName={booking.riderName}
      />
    </div>
  );
}
