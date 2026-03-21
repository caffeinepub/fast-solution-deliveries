import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import BottomNav from "../components/BottomNav";
import type { AppUser, BookingData, Screen } from "../types";

interface Props {
  booking: BookingData;
  onTrack: () => void;
  onHome: () => void;
  onNav: (s: Screen) => void;
  user: AppUser;
}

const DELIVERY_ICONS: Record<string, string> = {
  walking: "🚶",
  bike: "🏍️",
  metro: "🚇",
  bus: "🚌",
  courier: "📦",
};

export default function BookingConfirmation({
  booking,
  onTrack,
  onHome,
  onNav,
  user: _user,
}: Props) {
  const hasMultiLegs = booking.parcelLegs && booking.parcelLegs.length > 1;

  const routeStops: string[] = [];
  if (hasMultiLegs && booking.parcelLegs) {
    for (let i = 0; i < booking.parcelLegs.length; i++) {
      if (i === 0) routeStops.push(booking.parcelLegs[i].pickup);
      routeStops.push(booking.parcelLegs[i].drop);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center mb-8"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)" }}
          >
            ✅
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Booking Confirmed!
          </h2>
          <p className="text-muted-foreground mt-1">
            Your parcel is on its way
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm">Order ID</span>
            <span
              className="font-bold text-sm px-3 py-1 rounded-full"
              style={{ background: "rgba(255,107,0,0.1)", color: "#FF6B00" }}
            >
              {booking.orderId}
            </span>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <Row label="City" value={booking.city} />
            {!hasMultiLegs && (
              <>
                <Row label="Pickup" value={booking.pickup} />
                <Row label="Drop" value={booking.drop} />
              </>
            )}
            <Row label="Parcel" value={booking.description} />
            <Row
              label="No. of Parcels"
              value={`${booking.parcelCount} ${booking.parcelCount === 1 ? "parcel" : "parcels"}`}
            />
            <Row label="Weight" value={`${booking.weight} kg`} />
            <Row label="Distance" value={`${booking.distance} km`} />
            <Row
              label="Delivery Type"
              value={`${DELIVERY_ICONS[booking.deliveryType]} ${booking.deliveryType.charAt(0).toUpperCase() + booking.deliveryType.slice(1)}${
                booking.courierSubType ? ` (${booking.courierSubType})` : ""
              }`}
            />
            <Row
              label="Speed"
              value={
                booking.deliverySpeed === "fast"
                  ? "⚡ Fast (+₹5)"
                  : "🐢 Slow (Standard)"
              }
            />
            {booking.weightSurcharge > 0 && (
              <Row
                label="Weight Surcharge"
                value={`+₹${booking.weightSurcharge}`}
              />
            )}
            {booking.timeSurcharge > 0 && (
              <Row
                label="Distance Surcharge"
                value={`+₹${booking.timeSurcharge}`}
              />
            )}
            {booking.discount !== undefined &&
              booking.discount > 0 &&
              booking.couponCode && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupon ({booking.couponCode})</span>
                  <span>−₹{booking.discount}</span>
                </div>
              )}
            <div className="border-t border-border pt-3 flex justify-between font-bold">
              <span>Total Paid</span>
              <span style={{ color: "#FF6B00" }}>₹{booking.price}</span>
            </div>
          </div>
        </motion.div>

        {/* Multi-leg route section */}
        {hasMultiLegs && booking.parcelLegs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-4 mb-4"
          >
            <p className="text-sm font-semibold mb-3">🗺️ Multi-Stop Route</p>
            <div className="flex flex-col gap-2">
              {booking.parcelLegs.map((leg) => (
                <div
                  key={leg.parcelNo}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: "#FF6B00", fontSize: "10px" }}
                  >
                    {leg.parcelNo}
                  </span>
                  <span className="text-muted-foreground">
                    Leg {leg.parcelNo}:
                  </span>
                  <span className="font-medium truncate">{leg.pickup}</span>
                  <span className="text-orange-400 font-bold">→</span>
                  <span className="font-medium truncate">{leg.drop}</span>
                  <span className="ml-auto text-muted-foreground flex-shrink-0">
                    {leg.distance} km
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Full Route</p>
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
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-4 mb-6"
        >
          <p className="text-xs text-muted-foreground mb-2">ASSIGNED RIDER</p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
              }}
            >
              {booking.riderName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-sm">{booking.riderName}</p>
              <p className="text-xs text-muted-foreground">
                {booking.riderPhone}
              </p>
            </div>
            <div className="ml-auto">
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                ● Online
              </span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-3">
          <Button
            data-ocid="confirm.track.button"
            onClick={onTrack}
            className="w-full rounded-full text-white font-bold py-5"
            style={{ background: "linear-gradient(90deg, #FF6B00, #FF9500)" }}
          >
            Track Order
          </Button>
          <Button
            data-ocid="confirm.home.button"
            onClick={onHome}
            variant="outline"
            className="w-full rounded-full py-5"
          >
            Back to Home
          </Button>
        </div>
      </div>
      <BottomNav
        userRole="customer"
        activeScreen="booking-confirm"
        onNav={onNav}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[55%]">{value}</span>
    </div>
  );
}
