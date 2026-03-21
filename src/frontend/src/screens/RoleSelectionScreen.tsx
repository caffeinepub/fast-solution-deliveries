import { motion } from "motion/react";
import type { Role } from "../types";

interface Props {
  onSelect: (role: Role) => void;
}

export default function RoleSelectionScreen({ onSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <img
            src="/assets/uploads/1774125054011-1.png"
            alt="Fast Solution Deliveries Logo"
            className="w-32 h-32 object-contain mx-auto mb-2"
          />
          <p className="text-muted-foreground mt-2">
            How would you like to use the app?
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect("customer")}
            data-ocid="role.customer.button"
            className="w-full p-6 rounded-2xl border-2 border-border bg-card shadow-sm hover:border-orange-400 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                style={{ background: "rgba(255,107,0,0.1)" }}
              >
                📦
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">
                  I'm a Customer
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Send parcels across Delhi NCR &amp; nearby cities
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect("rider")}
            data-ocid="role.rider.button"
            className="w-full p-6 rounded-2xl border-2 border-border bg-card shadow-sm hover:border-orange-400 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                style={{ background: "rgba(255,107,0,0.1)" }}
              >
                🏍️
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">I'm a Rider</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Earn by delivering parcels in your area
                </p>
              </div>
            </div>
          </motion.button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Open to everyone — men, women &amp; differently-abled individuals
        </p>
      </motion.div>
    </div>
  );
}
