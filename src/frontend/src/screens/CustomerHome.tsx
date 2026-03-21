import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import BottomNav from "../components/BottomNav";
import type {
  AppUser,
  BookingData,
  CourierSubType,
  DeliverySpeed,
  DeliveryType,
  Screen,
} from "../types";
import {
  type DistanceResult,
  estimateSmartDistance,
} from "../utils/distanceEstimator";

const CITIES = [
  "Delhi",
  "Noida",
  "Gurugram",
  "Ghaziabad",
  "Faridabad",
  "Sonipat",
  "Rohtak",
  "Meerut",
  "Bahadurgarh",
];

const DELIVERY_TYPES: {
  id: DeliveryType;
  label: string;
  icon: string;
  desc: string;
  range: string;
  price: string;
}[] = [
  {
    id: "walking",
    label: "Walking",
    icon: "🚶",
    desc: "Doorstep pickup & delivery",
    range: "1–80 km",
    price: "₹20–₹130",
  },
  {
    id: "bike",
    label: "Bike",
    icon: "🏍️",
    desc: "Door-to-door service",
    range: "Any distance",
    price: "₹7–₹15/km",
  },
  {
    id: "metro",
    label: "Metro",
    icon: "🚇",
    desc: "Station-to-station only",
    range: "Long distance",
    price: "₹30–₹300",
  },
  {
    id: "bus",
    label: "Bus",
    icon: "🚌",
    desc: "Between bus stops",
    range: "Intercity",
    price: "₹50–₹80",
  },
  {
    id: "courier",
    label: "Courier",
    icon: "📦",
    desc: "Scheduled courier service",
    range: "Any distance",
    price: "₹120–₹200",
  },
];

interface DropLeg {
  id: number;
  drop: string;
  distance: number | null;
  distanceResult: DistanceResult | null;
}

let _legId = 0;
function emptyDrop(): DropLeg {
  return { id: ++_legId, drop: "", distance: null, distanceResult: null };
}

function autoDetectCourierType(
  weight: number,
  count: number,
): { subType: CourierSubType; reason: string } {
  const weightPerParcel = weight / count;
  if (weight > 10 || count >= 5 || weightPerParcel > 3) {
    return {
      subType: "bulk",
      reason:
        count >= 5
          ? `${count} parcels → Bulk Courier`
          : weight > 10
            ? `${weight} kg total → Bulk Courier`
            : `${weightPerParcel.toFixed(1)} kg/parcel → Bulk Courier`,
    };
  }
  return {
    subType: "normal",
    reason:
      count === 1
        ? "Single parcel → Normal Courier"
        : `${count} parcels, ${weight} kg → Normal Courier`,
  };
}

function calcWeightSurcharge(weight: number): number {
  if (weight <= 5) return 0;
  return Math.round((weight - 5) * 5);
}

function calcTimeSurcharge(distance: number): number {
  if (distance <= 10) return 0;
  return Math.min(10, Math.round((distance - 10) * 0.3));
}

function calcBaseCharge(
  type: DeliveryType,
  distance: number,
  courierSubType?: CourierSubType,
): number {
  switch (type) {
    case "walking":
      if (distance <= 20) return Math.min(40, Math.max(20, 20 + distance * 1));
      return Math.min(130, Math.max(40, 40 + (distance - 20) * 3));
    case "bike":
      return Math.round(
        Math.max(7, Math.min(15, 7 + distance * 0.1)) * distance,
      );
    case "metro":
      return Math.min(300, Math.max(30, 30 + distance * 4.5));
    case "bus":
      return Math.min(80, Math.max(50, 50 + distance * 0.6));
    case "courier":
      if (courierSubType === "bulk")
        return Math.min(200, Math.max(160, 160 + distance * 0.4));
      return Math.min(150, Math.max(120, 120 + distance * 0.3));
  }
}

const VALID_COUPONS: Record<
  string,
  {
    type: "percent" | "flat";
    value: number;
    maxDiscount?: number;
    condition?: string;
  }
> = {
  FIRST10: { type: "percent", value: 10, maxDiscount: 50 },
  SAVE20: { type: "flat", value: 20 },
  FASTSHIP: { type: "flat", value: 30, condition: "fast" },
  BULK15: { type: "percent", value: 15, condition: "bulk" },
};

interface Props {
  user: AppUser;
  onBook: (b: BookingData) => void;
  onNav: (s: Screen) => void;
}

export default function CustomerHome({ user, onBook, onNav }: Props) {
  const [city, setCity] = useState("");
  const [parcelCount, setParcelCount] = useState(1);
  const [sharedPickup, setSharedPickup] = useState("");
  const [drops, setDrops] = useState<DropLeg[]>([emptyDrop()]);
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("1");
  const [selectedType, setSelectedType] = useState<DeliveryType | null>(null);
  const [courierSubType, setCourierSubType] =
    useState<CourierSubType>("normal");
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>("slow");
  const [estimating, setEstimating] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const weightNum = Number.parseFloat(weight) || 1;

  const changeParcelCount = (newCount: number) => {
    const clamped = Math.max(1, Math.min(50, newCount));
    setParcelCount(clamped);
    setDrops((prev) => {
      if (clamped > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: clamped - prev.length }, emptyDrop),
        ];
      }
      return prev.slice(0, clamped);
    });
    setSelectedType(null);
    setAppliedCoupon(null);
    setCouponError("");
  };

  const updateDrop = (idx: number, value: string) => {
    setDrops((prev) =>
      prev.map((d, i) =>
        i === idx
          ? { ...d, drop: value, distance: null, distanceResult: null }
          : d,
      ),
    );
    setSelectedType(null);
  };

  const autoDetected =
    selectedType === "courier"
      ? autoDetectCourierType(weightNum, parcelCount)
      : null;
  const effectiveCourierSubType = autoDetected
    ? autoDetected.subType
    : courierSubType;

  const allEstimated = drops.every((d) => d.distance !== null);
  const totalDistance = allEstimated
    ? drops.reduce((sum, d) => sum + (d.distance ?? 0), 0)
    : null;

  // Chained route: pickup→drop1, drop1→drop2, drop2→drop3, ...
  const estimateAllDrops = async () => {
    if (!sharedPickup.trim()) {
      toast.error("Enter a shared pickup location first");
      return;
    }
    for (let i = 0; i < drops.length; i++) {
      if (!drops[i].drop.trim()) {
        toast.error(`Enter drop address for Drop ${i + 1}`);
        return;
      }
    }
    setEstimating(true);

    const results: DistanceResult[] = [];
    for (let i = 0; i < drops.length; i++) {
      const from = i === 0 ? sharedPickup : drops[i - 1].drop;
      const to = drops[i].drop;
      results.push(estimateSmartDistance(from, to));
    }

    setDrops((prev) =>
      prev.map((d, i) => ({
        ...d,
        distance: results[i].distance,
        distanceResult: results[i],
      })),
    );
    setEstimating(false);
    setSelectedType(null);

    const total = results.reduce((s, r) => s + r.distance, 0);
    const highCount = results.filter((r) => r.confidence === "high").length;
    if (highCount === results.length) {
      toast.success(
        `All ${results.length} legs AI matched — total ${total} km`,
      );
    } else {
      toast.info(
        `Estimated total: ${total} km (${highCount}/${results.length} AI matched)`,
      );
    }
  };

  const weightSurcharge = calcWeightSurcharge(weightNum);
  const timeSurcharge =
    totalDistance !== null ? calcTimeSurcharge(totalDistance) : 0;
  const fastCharge = deliverySpeed === "fast" ? 5 : 0;

  const singleBaseCharge =
    selectedType && totalDistance !== null
      ? Math.round(
          calcBaseCharge(
            selectedType,
            totalDistance,
            selectedType === "courier" ? effectiveCourierSubType : undefined,
          ),
        )
      : null;

  const baseCharge =
    singleBaseCharge !== null ? singleBaseCharge * parcelCount : null;
  const rawPrice =
    baseCharge !== null
      ? baseCharge + weightSurcharge + timeSurcharge + fastCharge
      : null;

  // Coupon calculations
  const calcDiscount = (
    code: string,
    priceVal: number,
  ): { discount: number; error: string } => {
    const upper = code.toUpperCase().trim();
    const coupon = VALID_COUPONS[upper];
    if (!coupon) return { discount: 0, error: "Invalid coupon code" };
    if (coupon.condition === "fast" && deliverySpeed !== "fast")
      return { discount: 0, error: "FASTSHIP only valid with Fast Delivery" };
    if (coupon.condition === "bulk" && effectiveCourierSubType !== "bulk")
      return { discount: 0, error: "BULK15 only valid with Bulk Courier" };
    let disc =
      coupon.type === "percent"
        ? Math.round((priceVal * coupon.value) / 100)
        : coupon.value;
    if (coupon.maxDiscount) disc = Math.min(disc, coupon.maxDiscount);
    return { discount: disc, error: "" };
  };

  const discountAmount =
    appliedCoupon && rawPrice !== null
      ? calcDiscount(appliedCoupon, rawPrice).discount
      : 0;
  const price =
    rawPrice !== null ? Math.max(1, rawPrice - discountAmount) : null;

  const handleApplyCoupon = () => {
    if (!rawPrice) {
      setCouponError("Calculate price first");
      return;
    }
    const { discount, error } = calcDiscount(couponInput, rawPrice);
    if (error) {
      setCouponError(error);
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(couponInput.toUpperCase().trim());
      setCouponError("");
      toast.success(`Coupon applied! You save ₹${discount}`);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  // Route stops for display
  const routeStops: string[] = [];
  if (sharedPickup) routeStops.push(sharedPickup);
  for (const d of drops) {
    if (d.drop) routeStops.push(d.drop);
  }

  const handleBook = () => {
    if (!city) {
      toast.error("Select a city");
      return;
    }
    if (!sharedPickup.trim()) {
      toast.error("Enter a pickup location");
      return;
    }
    for (let i = 0; i < drops.length; i++) {
      if (!drops[i].drop.trim()) {
        toast.error(`Enter drop address for Drop ${i + 1}`);
        return;
      }
      if (drops[i].distance === null) {
        toast.error(`Estimate distance for Drop ${i + 1} first`);
        return;
      }
    }
    if (!selectedType) {
      toast.error("Select a delivery type");
      return;
    }

    const orderId = `FSD-${Math.floor(100000 + Math.random() * 900000)}`;
    onBook({
      orderId,
      city,
      pickup: sharedPickup,
      drop: drops[drops.length - 1].drop,
      description: description || "General parcel",
      weight: weightNum,
      parcelCount,
      distance: totalDistance!,
      deliveryType: selectedType,
      courierSubType:
        selectedType === "courier" ? effectiveCourierSubType : undefined,
      deliverySpeed,
      price: price!,
      baseCharge: baseCharge!,
      weightSurcharge,
      timeSurcharge,
      fastCharge,
      couponCode: appliedCoupon ?? undefined,
      discount: discountAmount > 0 ? discountAmount : undefined,
      status: "placed",
      riderName: "Rahul Verma",
      riderPhone: "9876543210",
      parcelLegs: drops.map((d, i) => ({
        parcelNo: i + 1,
        pickup: i === 0 ? sharedPickup : drops[i - 1].drop,
        drop: d.drop,
        distance: d.distance!,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 px-4 py-4 bg-white border-b border-border">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Send a Parcel</h1>
            <p className="text-xs text-muted-foreground">
              Hello, {user.name.split(" ")[0]} 👋
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)" }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 flex flex-col gap-5">
        {/* City */}
        <div>
          <Label className="text-sm font-semibold">City</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger data-ocid="home.city.select" className="mt-1">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Number of parcels */}
        <div>
          <Label className="text-sm font-semibold">
            Number of Drops / Parcels
          </Label>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              data-ocid="home.parcel_count.secondary_button"
              onClick={() => changeParcelCount(parcelCount - 1)}
              className="w-10 h-10 rounded-full border-2 border-orange-400 text-orange-600 text-xl font-bold flex items-center justify-center hover:bg-orange-50 transition-colors"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-foreground">
                {parcelCount}
              </span>
              <p className="text-xs text-muted-foreground">
                {parcelCount === 1 ? "drop" : "drops"}
              </p>
            </div>
            <button
              type="button"
              data-ocid="home.parcel_count.primary_button"
              onClick={() => changeParcelCount(parcelCount + 1)}
              className="w-10 h-10 rounded-full border-2 border-orange-400 text-orange-600 text-xl font-bold flex items-center justify-center hover:bg-orange-50 transition-colors"
            >
              +
            </button>
          </div>
          {parcelCount > 1 && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              One shared pickup → {parcelCount} sequential drops
            </p>
          )}
        </div>

        {/* Shared Pickup */}
        <div
          className="bg-card rounded-2xl border border-border overflow-hidden"
          style={{ borderLeft: "4px solid #22c55e" }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{ background: "rgba(34,197,94,0.06)" }}
          >
            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              Shared Pickup Location
            </span>
          </div>
          <div className="p-4">
            <Label className="text-xs text-muted-foreground">PICKUP FROM</Label>
            <Input
              data-ocid="home.pickup.input"
              value={sharedPickup}
              onChange={(e) => {
                setSharedPickup(e.target.value);
                setDrops((prev) =>
                  prev.map((d) => ({
                    ...d,
                    distance: null,
                    distanceResult: null,
                  })),
                );
                setSelectedType(null);
              }}
              placeholder="e.g. Rohini Avantika Sector 1"
              className="mt-1 border-0 p-0 h-auto text-sm focus-visible:ring-0 bg-transparent"
            />
          </div>
        </div>

        {/* Drop address cards — one per parcel */}
        <AnimatePresence initial={false}>
          {drops.map((drop, idx) => (
            <motion.div
              key={drop.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl border border-border overflow-hidden"
              style={{ borderLeft: "4px solid #FF6B00" }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2"
                style={{ background: "rgba(255,107,0,0.06)" }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "#FF6B00" }}
                >
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  Drop {idx + 1}
                </span>
                {drop.distance !== null && drop.distanceResult && (
                  <span
                    className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        drop.distanceResult.confidence === "high"
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(251,191,36,0.1)",
                      color:
                        drop.distanceResult.confidence === "high"
                          ? "#16a34a"
                          : "#b45309",
                    }}
                  >
                    {drop.distanceResult.confidence === "high" ? "✅" : "⚠️"}{" "}
                    {drop.distance} km
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-2 w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">
                      DROP LOCATION
                    </Label>
                    <Input
                      data-ocid={`home.drop.input.${idx + 1}`}
                      value={drop.drop}
                      onChange={(e) => updateDrop(idx, e.target.value)}
                      placeholder={
                        idx === 0
                          ? "e.g. D1 Saket"
                          : idx === 1
                            ? "e.g. Noida Sector 18"
                            : `e.g. Drop location ${idx + 1}`
                      }
                      className="mt-1 border-0 p-0 h-auto text-sm focus-visible:ring-0 bg-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-6">
                  Leg:{" "}
                  {idx === 0
                    ? sharedPickup || "Pickup"
                    : drops[idx - 1].drop || `Drop ${idx}`}{" "}
                  → {drop.drop || "…"}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Route chain strip */}
        {routeStops.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3"
          >
            <p className="text-xs font-semibold text-orange-700 mb-2">
              🗺️ Route Chain
            </p>
            <div className="flex flex-wrap items-center gap-1">
              {routeStops.map((stop, i) => (
                <span
                  key={stop + String(i)}
                  className="flex items-center gap-1"
                >
                  <span className="text-xs font-medium text-foreground bg-white border border-orange-200 rounded-full px-2 py-0.5">
                    {stop}
                  </span>
                  {i < routeStops.length - 1 && (
                    <span className="text-orange-400 text-xs font-bold">→</span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Parcel details */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Label className="text-sm font-semibold">Parcel Description</Label>
            <Input
              data-ocid="home.description.input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Documents, Clothes"
              className="mt-1"
            />
          </div>
          <div className="w-28">
            <Label className="text-sm font-semibold">Weight (kg)</Label>
            <Input
              data-ocid="home.weight.input"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="1"
              className="mt-1"
              min="0.1"
              step="0.5"
            />
          </div>
        </div>

        {weightNum > 5 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-700">
            ⚠️ Weight surcharge applies for parcels over 5 kg: +₹
            {weightSurcharge}
          </div>
        )}

        <Button
          data-ocid="home.estimate.button"
          onClick={estimateAllDrops}
          disabled={estimating}
          variant="outline"
          className="w-full rounded-full border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          🤖 AI Distance Estimate
          {parcelCount > 1 ? ` (${parcelCount} Drops)` : ""}
        </Button>

        {/* Total distance summary */}
        {totalDistance !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-orange-700">
                📏 Total Distance: {totalDistance} km
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                ✅ All Estimated
              </span>
            </div>
            {parcelCount > 1 && (
              <div className="flex flex-col gap-1 mt-1">
                {drops.map((d, i) => (
                  <div
                    key={d.id}
                    className="flex justify-between text-xs text-muted-foreground"
                  >
                    <span>
                      Leg {i + 1}: {i === 0 ? sharedPickup : drops[i - 1].drop}{" "}
                      → {d.drop}
                    </span>
                    <span className="font-medium text-foreground ml-2">
                      {d.distance} km
                    </span>
                  </div>
                ))}
              </div>
            )}
            {parcelCount === 1 &&
              drops[0].distanceResult?.confidence === "high" &&
              drops[0].distanceResult.pickupArea &&
              drops[0].distanceResult.dropArea && (
                <p className="text-xs text-green-700 mt-1">
                  {drops[0].distanceResult.pickupArea} →{" "}
                  {drops[0].distanceResult.dropArea}
                </p>
              )}
          </motion.div>
        )}

        {/* Delivery type + speed */}
        {totalDistance !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            <div>
              <Label className="text-sm font-semibold">
                Select Delivery Type
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {DELIVERY_TYPES.map((dt) => {
                  const active = selectedType === dt.id;
                  return (
                    <button
                      type="button"
                      key={dt.id}
                      data-ocid={`home.${dt.id}.button`}
                      onClick={() => setSelectedType(dt.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        active
                          ? "border-orange-500 bg-orange-50"
                          : "border-border bg-card hover:border-orange-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{dt.icon}</div>
                      <p className="font-semibold text-sm">{dt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dt.desc}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dt.range}
                      </p>
                      <p
                        className="text-sm font-bold mt-2"
                        style={{ color: "#FF6B00" }}
                      >
                        {dt.price}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedType === "courier" && autoDetected && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Label className="text-sm font-semibold">Courier Type</Label>
                <div
                  className={`mt-2 rounded-2xl border-2 p-3 flex items-center gap-3 ${
                    autoDetected.subType === "bulk"
                      ? "border-orange-400 bg-orange-50"
                      : "border-green-400 bg-green-50"
                  }`}
                >
                  <span className="text-2xl">
                    {autoDetected.subType === "bulk" ? "📦" : "📄"}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {autoDetected.subType === "bulk"
                        ? "Bulk Courier (Auto)"
                        : "Normal Courier (Auto)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {autoDetected.reason}
                    </p>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#FF6B00" }}
                  >
                    {autoDetected.subType === "bulk"
                      ? "₹160–₹200"
                      : "₹120–₹150"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-1">
                  Auto-selected based on weight ({weightNum} kg) and parcel
                  count ({parcelCount}). Override:
                </p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    {
                      id: "normal" as CourierSubType,
                      icon: "📄",
                      label: "Normal",
                      price: "₹120–₹150",
                    },
                    {
                      id: "bulk" as CourierSubType,
                      icon: "📦",
                      label: "Bulk",
                      price: "₹160–₹200",
                    },
                  ].map((ct) => (
                    <button
                      type="button"
                      key={ct.id}
                      onClick={() => setCourierSubType(ct.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all text-xs ${
                        effectiveCourierSubType === ct.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-border bg-card hover:border-orange-300"
                      }`}
                    >
                      <span className="text-lg">{ct.icon}</span>
                      <p className="font-semibold mt-1">{ct.label}</p>
                      <p style={{ color: "#FF6B00" }} className="font-bold">
                        {ct.price}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div>
              <Label className="text-sm font-semibold">Delivery Speed</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setDeliverySpeed("slow")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    deliverySpeed === "slow"
                      ? "border-orange-500 bg-orange-50"
                      : "border-border bg-card hover:border-orange-300"
                  }`}
                >
                  <div className="text-2xl mb-2">🐢</div>
                  <p className="font-semibold text-sm">Slow Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    Standard speed
                  </p>
                  <p className="text-sm font-bold mt-1 text-green-600">
                    No extra charge
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliverySpeed("fast")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    deliverySpeed === "fast"
                      ? "border-orange-500 bg-orange-50"
                      : "border-border bg-card hover:border-orange-300"
                  }`}
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <p className="font-semibold text-sm">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    Priority handling
                  </p>
                  <p
                    className="text-sm font-bold mt-1"
                    style={{ color: "#FF6B00" }}
                  >
                    +₹5
                  </p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Price breakdown */}
        {rawPrice !== null && selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <p className="font-semibold mb-3">Price Breakdown</p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Base charge ({selectedType}
                  {selectedType === "courier"
                    ? ` · ${effectiveCourierSubType}`
                    : ""}
                  )
                </span>
                <span>₹{singleBaseCharge}</span>
              </div>
              {parcelCount > 1 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    × {parcelCount} parcels
                  </span>
                  <span>₹{baseCharge}</span>
                </div>
              )}
              {weightSurcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Weight surcharge ({weightNum} kg, over 5 kg)
                  </span>
                  <span>₹{weightSurcharge}</span>
                </div>
              )}
              {timeSurcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Long-distance surcharge
                  </span>
                  <span>₹{timeSurcharge}</span>
                </div>
              )}
              {fastCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fast delivery</span>
                  <span>₹{fastCharge}</span>
                </div>
              )}
              {discountAmount > 0 && appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupon ({appliedCoupon})</span>
                  <span>−₹{discountAmount}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span style={{ color: "#FF6B00" }}>₹{price}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Coupon code section */}
        {rawPrice !== null && selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🏷️</span>
              <p className="font-semibold text-sm">Apply Coupon</p>
            </div>

            {!appliedCoupon ? (
              <>
                <div className="flex gap-2">
                  <Input
                    data-ocid="home.coupon.input"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Enter coupon code"
                    className="flex-1 text-sm uppercase placeholder:normal-case"
                  />
                  <Button
                    data-ocid="home.coupon.primary_button"
                    onClick={handleApplyCoupon}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold"
                  >
                    Apply
                  </Button>
                </div>
                {couponError && (
                  <p
                    className="text-xs text-red-500 mt-1.5"
                    data-ocid="home.coupon.error_state"
                  >
                    ❌ {couponError}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["FIRST10", "SAVE20", "FASTSHIP", "BULK15"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setCouponInput(code);
                        setCouponError("");
                      }}
                      className="text-xs border border-dashed border-orange-300 text-orange-600 px-2 py-1 rounded-full hover:bg-orange-50 transition-colors"
                    >
                      {code}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tap a code above or type your own
                </p>
              </>
            ) : (
              <div
                className="flex items-center gap-3 p-3 rounded-xl border border-green-200 bg-green-50"
                data-ocid="home.coupon.success_state"
              >
                <span className="text-xl">✅</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-700">
                    {appliedCoupon} applied!
                  </p>
                  <p className="text-xs text-green-600">
                    You save ₹{discountAmount}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors underline"
                >
                  Remove
                </button>
              </div>
            )}
          </motion.div>
        )}

        <Button
          data-ocid="home.book.button"
          onClick={handleBook}
          disabled={!selectedType || price === null}
          className="w-full rounded-full text-white font-bold py-6 text-base"
          style={{
            background: selectedType
              ? "linear-gradient(90deg, #FF6B00, #FF9500)"
              : undefined,
          }}
        >
          Book Now
        </Button>
      </div>

      <BottomNav
        userRole="customer"
        activeScreen="customer-home"
        onNav={onNav}
      />
    </div>
  );
}
