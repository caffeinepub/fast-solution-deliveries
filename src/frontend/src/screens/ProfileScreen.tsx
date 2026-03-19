import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import BottomNav from "../components/BottomNav";
import type { AppUser, Screen } from "../types";

interface Props {
  user: AppUser;
  onLogout: () => void;
  onNav: (s: Screen) => void;
}

export default function ProfileScreen({ user, onLogout, onNav }: Props) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      <div
        className="px-4 pt-12 pb-8 text-white"
        style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)" }}
      >
        <div className="max-w-md mx-auto text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-white/80 text-sm mt-1 capitalize">{user.role}</p>
          {user.role === "rider" && (
            <div className="flex gap-2 justify-center mt-3">
              {user.aadhaar && (
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                  ✓ Aadhaar Verified
                </span>
              )}
              {user.pan && (
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                  ✓ PAN Verified
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl overflow-hidden mb-5"
        >
          <InfoRow icon="👤" label="Full Name" value={user.name} />
          <InfoRow icon="✉️" label="Email" value={user.email} border />
          <InfoRow icon="📱" label="Phone" value={user.phone} border />
          {user.role === "rider" && user.aadhaar && (
            <InfoRow
              icon="🪪"
              label="Aadhaar"
              value={`**** **** ${user.aadhaar.slice(-4)}`}
              border
            />
          )}
          {user.role === "rider" && user.pan && (
            <InfoRow icon="📄" label="PAN" value={user.pan} border />
          )}
        </motion.div>

        <Button
          data-ocid="profile.logout.button"
          onClick={onLogout}
          variant="outline"
          className="w-full rounded-full py-5 border-red-200 text-red-600 hover:bg-red-50"
        >
          Log Out
        </Button>
      </div>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        © {currentYear}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>

      <BottomNav userRole={user.role} activeScreen="profile" onNav={onNav} />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  border,
}: { icon: string; label: string; value: string; border?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-4 ${border ? "border-t border-border" : ""}`}
    >
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}
