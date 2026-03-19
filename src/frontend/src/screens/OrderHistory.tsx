import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { useState } from "react";
import BottomNav from "../components/BottomNav";
import type { AppUser, BookingData, Screen } from "../types";

const MOCK_ORDERS: BookingData[] = [
  {
    orderId: "FSD-482019",
    city: "Delhi",
    pickup: "Connaught Place",
    drop: "Lajpat Nagar",
    description: "Clothes",
    weight: 2,
    distance: 8.5,
    deliveryType: "bike",
    price: 91,
    status: "delivered",
    riderName: "Rahul Verma",
    riderPhone: "9876543210",
  },
  {
    orderId: "FSD-371842",
    city: "Noida",
    pickup: "Sector 18",
    drop: "Sector 62",
    description: "Documents",
    weight: 0.5,
    distance: 12,
    deliveryType: "metro",
    price: 62,
    status: "transit",
    riderName: "Sunita Devi",
    riderPhone: "9812345678",
  },
  {
    orderId: "FSD-295741",
    city: "Gurugram",
    pickup: "DLF Phase 2",
    drop: "Sohna Road",
    description: "Electronics",
    weight: 3,
    distance: 5.2,
    deliveryType: "bike",
    price: 83,
    status: "delivered",
    riderName: "Mohan Singh",
    riderPhone: "9765432109",
  },
  {
    orderId: "FSD-184562",
    city: "Delhi",
    pickup: "Saket",
    drop: "Rohini",
    description: "Books",
    weight: 4,
    distance: 22,
    deliveryType: "bus",
    price: 134,
    status: "delivered",
    riderName: "Priya Yadav",
    riderPhone: "9654321098",
  },
];

const STATUS_STYLES: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  assigned: "bg-yellow-100 text-yellow-700",
  picked: "bg-purple-100 text-purple-700",
  transit: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  assigned: "Rider Assigned",
  picked: "Picked Up",
  transit: "In Transit",
  delivered: "Delivered",
};

interface Props {
  onNav: (s: Screen) => void;
  user: AppUser;
  currentBooking: BookingData | null;
}

export default function OrderHistory({
  onNav,
  user: _user,
  currentBooking,
}: Props) {
  const [filter, setFilter] = useState("all");
  const allOrders = currentBooking
    ? [currentBooking, ...MOCK_ORDERS]
    : MOCK_ORDERS;

  const filtered = allOrders.filter((o) => {
    if (filter === "active") return o.status !== "delivered";
    if (filter === "completed") return o.status === "delivered";
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-4">
        <div className="max-w-md mx-auto">
          <h2 className="font-bold text-lg">Order History</h2>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="w-full mb-4">
            <TabsTrigger
              value="all"
              className="flex-1"
              data-ocid="history.all.tab"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="flex-1"
              data-ocid="history.active.tab"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex-1"
              data-ocid="history.completed.tab"
            >
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <div
            data-ocid="history.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <div className="text-5xl mb-4">📦</div>
            <p className="font-medium">No orders found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order, i) => (
              <motion.div
                key={order.orderId}
                data-ocid={`history.item.${i + 1}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">{order.orderId}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.city}
                    </p>
                  </div>
                  <Badge
                    className={`text-xs font-medium border-0 ${STATUS_STYLES[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span className="text-green-500">●</span>
                  <span className="truncate">{order.pickup}</span>
                  <span>→</span>
                  <span className="text-red-500">●</span>
                  <span className="truncate">{order.drop}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {order.distance} km · {order.deliveryType}
                  </span>
                  <span className="font-bold" style={{ color: "#FF6B00" }}>
                    ₹{order.price}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav
        userRole="customer"
        activeScreen="order-history"
        onNav={onNav}
      />
    </div>
  );
}
