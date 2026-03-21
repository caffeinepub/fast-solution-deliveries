import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { BookingData, Screen } from "../types";

interface Props {
  booking: BookingData;
  onPaid: () => void;
  onNav: (s: Screen) => void;
}

const UPI_ID = "sem.jitu-1@oksbi";

export default function PaymentScreen({ booking, onPaid }: Props) {
  const [txnId, setTxnId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaid = () => {
    if (!txnId.trim()) {
      toast.error("Please enter the Transaction ID to confirm payment");
      return;
    }
    toast.success("Payment verified! Booking confirmed.");
    onPaid();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div
        className="px-4 pt-10 pb-6 text-white text-center"
        style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)" }}
      >
        <div className="max-w-md mx-auto">
          <p className="text-white/80 text-xs font-medium tracking-widest uppercase mb-1">
            Pay to
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Fast Solution Deliveries
          </h1>
          <p className="text-white/80 text-sm mt-1">Secure UPI Payment</p>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* Amount Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-4 text-center"
        >
          <p className="text-muted-foreground text-sm mb-1">Amount to Pay</p>
          <p className="text-4xl font-extrabold" style={{ color: "#FF6B00" }}>
            ₹{booking.price}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Order ID: {booking.orderId}
          </p>
        </motion.div>

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-3"
        >
          <p className="text-sm font-semibold text-foreground">
            Scan to Pay with any UPI app
          </p>
          <img
            src="/assets/uploads/GooglePay_QR-1.png"
            alt="UPI QR Code - Fast Solution Deliveries"
            className="w-56 h-56 object-contain rounded-xl border border-border shadow-sm"
          />
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 w-full justify-between">
            <span className="text-sm font-medium text-foreground truncate">
              {UPI_ID}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
              style={{
                background: copied
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(255,107,0,0.12)",
                color: copied ? "#16a34a" : "#FF6B00",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Google Pay · PhonePe · Paytm · Any UPI app
          </p>
        </motion.div>

        {/* Transaction ID */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3"
        >
          <p className="text-sm font-semibold">Enter Transaction ID</p>
          <p className="text-xs text-muted-foreground">
            After paying, enter the UPI transaction / reference ID from your
            payment app to confirm.
          </p>
          <Input
            data-ocid="payment.txn_id"
            placeholder="e.g. 4293847561023"
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            className="rounded-xl"
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            data-ocid="payment.paid_button"
            onClick={handlePaid}
            disabled={!txnId.trim()}
            className="w-full rounded-full text-white font-bold py-5 text-base disabled:opacity-50"
            style={{ background: "linear-gradient(90deg, #FF6B00, #FF9500)" }}
          >
            ✅ I have Paid
          </Button>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground">
          Once you confirm, your booking will be finalized and a rider assigned.
        </p>
      </div>
    </div>
  );
}
