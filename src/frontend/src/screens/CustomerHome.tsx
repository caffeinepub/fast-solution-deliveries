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
import { motion } from "motion/react";
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
    price: "₹10–₹20",
  },
];

// Auto-detect courier sub-type based on weight per parcel and total count
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

// Weight surcharge only applies above 5 kg
function calcWeightSurcharge(weight: number): number {
  if (weight <= 5) return 0;
  return Math.round((weight - 5) * 5);
}

// Time surcharge: scales with distance, max ₹10
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
        return Math.min(20, Math.max(15, 15 + distance * 0.05));
      return Math.min(14, Math.max(10, 10 + distance * 0.04));
  }
}

interface Props {
  user: AppUser;
  onBook: (b: BookingData) => void;
  onNav: (s: Screen) => void;
}

export default function CustomerHome({ user, onBook, onNav }: Props) {
  const [city, setCity] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("1");
  const [parcelCount, setParcelCount] = useState(1);
  const [distance, setDistance] = useState<number | null>(null);
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<DeliveryType | null>(null);
  const [courierSubType, setCourierSubType] =
    useState<CourierSubType>("normal");
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>("slow");

  const weightNum = Number.parseFloat(weight) || 1;

  // When courier is selected, auto-detect sub-type from weight + count
  const autoDetected =
    selectedType === "courier"
      ? autoDetectCourierType(weightNum, parcelCount)
      : null;
  const effectiveCourierSubType = autoDetected
    ? autoDetected.subType
    : courierSubType;

  const estimateDistance = () => {
    if (!pickup || !drop) {
      toast.error("Enter pickup and drop locations first");
      return;
    }
    const result = estimateSmartDistance(pickup, drop);
    setDistance(result.distance);
    setDistanceResult(result);
    setSelectedType(null);

    if (result.confidence === "high") {
      toast.success(
        `AI matched: ${result.pickupArea} → ${result.dropArea} — ${result.distance} km (road distance)`,
      );
    } else if (result.confidence === "medium") {
      toast.info(`Partial match — estimated ${result.distance} km`);
    } else {
      toast.warning(
        `Could not identify areas — rough estimate: ${result.distance} km`,
      );
    }
  };

  const weightSurcharge = calcWeightSurcharge(weightNum);
  const timeSurcharge = distance !== null ? calcTimeSurcharge(distance) : 0;
  const fastCharge = deliverySpeed === "fast" ? 5 : 0;

  const singleBaseCharge =
    selectedType && distance !== null
      ? Math.round(
          calcBaseCharge(
            selectedType,
            distance,
            selectedType === "courier" ? effectiveCourierSubType : undefined,
          ),
        )
      : null;

  const baseCharge =
    singleBaseCharge !== null ? singleBaseCharge * parcelCount : null;

  const price =
    baseCharge !== null
      ? baseCharge + weightSurcharge + timeSurcharge + fastCharge
      : null;

  const handleBook = () => {
    if (!city) {
      toast.error("Select a city");
      return;
    }
    if (!pickup.trim()) {
      toast.error("Enter pickup location");
      return;
    }
    if (!drop.trim()) {
      toast.error("Enter drop location");
      return;
    }
    if (distance === null) {
      toast.error("Click AI Distance Estimate first");
      return;
    }
    if (!selectedType) {
      toast.error("Select a delivery type");
      return;
    }

    const orderId = `FSD-${Math.floor(100000 + Math.random() * 900000)}`;
    onBook({
      orderId,
      city,
      pickup,
      drop,
      description: description || "General parcel",
      weight: weightNum,
      parcelCount,
      distance,
      deliveryType: selectedType,
      courierSubType:
        selectedType === "courier" ? effectiveCourierSubType : undefined,
      deliverySpeed,
      price: price!,
      baseCharge: baseCharge!,
      weightSurcharge,
      timeSurcharge,
      fastCharge,
      status: "placed",
      riderName: "Rahul Verma",
      riderPhone: "9876543210",
    });
  };

  const confidenceBadge = distanceResult ? (
    distanceResult.confidence === "high" ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        ✅ AI Matched
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
        ⚠️ Estimated
      </span>
    )
  ) : null;

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

        <div className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-2 w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">
                PICKUP LOCATION
              </Label>
              <Input
                data-ocid="home.pickup.input"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="e.g. Connaught Place, Karol Bagh…"
                className="mt-1 border-0 p-0 h-auto text-sm focus-visible:ring-0 bg-transparent"
              />
            </div>
          </div>
          <div className="ml-1.5 border-l-2 border-dashed border-muted h-4" />
          <div className="flex items-start gap-3">
            <div className="mt-2 w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">
                DROP LOCATION
              </Label>
              <Input
                data-ocid="home.drop.input"
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                placeholder="e.g. Saket, Noida Sector 18…"
                className="mt-1 border-0 p-0 h-auto text-sm focus-visible:ring-0 bg-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            🤖 Type area names for AI-accurate distance
          </p>
        </div>

        {/* Parcel details row */}
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

        {/* Parcel / Courier quantity selector */}
        <div>
          <Label className="text-sm font-semibold">Number of Parcels</Label>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => setParcelCount((c) => Math.max(1, c - 1))}
              className="w-10 h-10 rounded-full border-2 border-orange-400 text-orange-600 text-xl font-bold flex items-center justify-center hover:bg-orange-50 transition-colors"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-foreground">
                {parcelCount}
              </span>
              <p className="text-xs text-muted-foreground">
                {parcelCount === 1 ? "parcel" : "parcels"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setParcelCount((c) => Math.min(50, c + 1))}
              className="w-10 h-10 rounded-full border-2 border-orange-400 text-orange-600 text-xl font-bold flex items-center justify-center hover:bg-orange-50 transition-colors"
            >
              +
            </button>
          </div>
          {parcelCount > 1 && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              Total weight: {weightNum * parcelCount} kg across {parcelCount}{" "}
              parcels
            </p>
          )}
        </div>

        {weightNum > 5 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-700">
            ⚠️ Weight surcharge applies for parcels over 5 kg: +₹
            {weightSurcharge}
          </div>
        )}

        <Button
          data-ocid="home.estimate.button"
          onClick={estimateDistance}
          variant="outline"
          className="w-full rounded-full border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          🤖 AI Distance Estimate
        </Button>

        {distance !== null && distanceResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-orange-700">
                📏 {distance} km
              </span>
              {confidenceBadge}
            </div>
            {distanceResult.confidence === "high" &&
              distanceResult.pickupArea &&
              distanceResult.dropArea && (
                <p className="text-xs text-green-700 mt-1">
                  {distanceResult.pickupArea} → {distanceResult.dropArea}
                </p>
              )}
            {distanceResult.confidence !== "high" && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Area not fully identified — please verify distance manually
              </p>
            )}
          </motion.div>
        )}

        {distance !== null && (
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

            {/* Courier: auto-detected type shown as info, manual override still available */}
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
                    {autoDetected.subType === "bulk" ? "₹15–₹20" : "₹10–₹14"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-1">
                  Auto-selected based on weight ({weightNum} kg) and parcel
                  count ({parcelCount}). You can override:
                </p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    {
                      id: "normal" as CourierSubType,
                      icon: "📄",
                      label: "Normal",
                      price: "₹10–₹14",
                    },
                    {
                      id: "bulk" as CourierSubType,
                      icon: "📦",
                      label: "Bulk",
                      price: "₹15–₹20",
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

        {price !== null && selectedType && (
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
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span style={{ color: "#FF6B00" }}>₹{price}</span>
              </div>
            </div>
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
