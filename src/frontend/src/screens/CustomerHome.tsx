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
import type { AppUser, BookingData, DeliveryType, Screen } from "../types";

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
  minKm: number;
  maxKm: number;
}[] = [
  {
    id: "walking",
    label: "Walking",
    icon: "🚶",
    desc: "Doorstep pickup & delivery",
    range: "Up to 1 km",
    price: "₹20–₹40",
    minKm: 0,
    maxKm: 1,
  },
  {
    id: "bike",
    label: "Bike",
    icon: "🏍️",
    desc: "Door-to-door service",
    range: "1–60 km",
    price: "₹50–₹150",
    minKm: 1,
    maxKm: 60,
  },
  {
    id: "metro",
    label: "Metro",
    icon: "🚇",
    desc: "Station-to-station only",
    range: "Long distance",
    price: "₹40–₹120",
    minKm: 1,
    maxKm: 60,
  },
  {
    id: "bus",
    label: "Bus",
    icon: "🚌",
    desc: "Between bus stops",
    range: "Intercity",
    price: "₹60–₹180",
    minKm: 1,
    maxKm: 60,
  },
];

function calcPrice(
  type: DeliveryType,
  distance: number,
  weight: number,
): number {
  const weightCharge = Math.max(0, weight - 1) * 10;
  switch (type) {
    case "walking":
      return Math.min(40, Math.max(20, 20 + distance * 15)) + weightCharge;
    case "bike":
      return Math.min(150, Math.max(50, 50 + distance * 2.5)) + weightCharge;
    case "metro":
      return Math.min(120, Math.max(40, 40 + distance * 1.8)) + weightCharge;
    case "bus":
      return Math.min(180, Math.max(60, 60 + distance * 2)) + weightCharge;
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
  const [distance, setDistance] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<DeliveryType | null>(null);

  const estimateDistance = () => {
    if (!pickup || !drop) {
      toast.error("Enter pickup and drop locations first");
      return;
    }
    const d = Number.parseFloat((Math.random() * 59.5 + 0.5).toFixed(1));
    setDistance(d);
    setSelectedType(null);
    toast.success(`Estimated distance: ${d} km`);
  };

  const price =
    selectedType && distance !== null
      ? Math.round(
          calcPrice(selectedType, distance, Number.parseFloat(weight) || 1),
        )
      : null;

  const baseCharge =
    selectedType && distance !== null
      ? Math.round(
          calcPrice(selectedType, distance, 1) -
            Math.max(0, (Number.parseFloat(weight) || 1) - 1) * 10,
        )
      : null;

  const weightCharge = selectedType
    ? Math.round(Math.max(0, (Number.parseFloat(weight) || 1) - 1) * 10)
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
      toast.error("Click Estimate Distance first");
      return;
    }
    if (!selectedType) {
      toast.error("Select a delivery type");
      return;
    }

    if (selectedType === "walking" && distance > 1) {
      toast.error("Walking delivery only available up to 1 km");
      return;
    }

    const orderId = `FSD-${Math.floor(100000 + Math.random() * 900000)}`;
    onBook({
      orderId,
      city,
      pickup,
      drop,
      description: description || "General parcel",
      weight: Number.parseFloat(weight) || 1,
      distance,
      deliveryType: selectedType,
      price: price!,
      status: "placed",
      riderName: "Rahul Verma",
      riderPhone: "9876543210",
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
                placeholder="Enter pickup address"
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
                placeholder="Enter delivery address"
                className="mt-1 border-0 p-0 h-auto text-sm focus-visible:ring-0 bg-transparent"
              />
            </div>
          </div>
        </div>

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

        <Button
          data-ocid="home.estimate.button"
          onClick={estimateDistance}
          variant="outline"
          className="w-full rounded-full border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          📍 Estimate Distance
        </Button>

        {distance !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-center"
          >
            <span className="text-sm font-semibold text-orange-700">
              📏 Estimated distance: {distance} km
            </span>
          </motion.div>
        )}

        {distance !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Label className="text-sm font-semibold">
              Select Delivery Type
            </Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {DELIVERY_TYPES.map((dt) => {
                const disabled = dt.id === "walking" && distance > 1;
                const active = selectedType === dt.id;
                return (
                  <button
                    type="button"
                    key={dt.id}
                    data-ocid={`home.${dt.id}.button`}
                    disabled={disabled}
                    onClick={() => !disabled && setSelectedType(dt.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      active
                        ? "border-orange-500 bg-orange-50"
                        : disabled
                          ? "border-border bg-muted opacity-50 cursor-not-allowed"
                          : "border-border bg-card hover:border-orange-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{dt.icon}</div>
                    <p className="font-semibold text-sm">{dt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {dt.desc}
                    </p>
                    <p className="text-xs text-muted-foreground">{dt.range}</p>
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
                  Base + distance charge
                </span>
                <span>₹{baseCharge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Weight surcharge ({weight} kg)
                </span>
                <span>₹{weightCharge}</span>
              </div>
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
