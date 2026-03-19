import type { Role, Screen } from "../types";

interface NavItem {
  icon: string;
  label: string;
  screen: Screen;
  ocid: string;
}

const CUSTOMER_NAV: NavItem[] = [
  { icon: "🏠", label: "Home", screen: "customer-home", ocid: "nav.home.link" },
  {
    icon: "📍",
    label: "Track",
    screen: "order-tracking",
    ocid: "nav.track.link",
  },
  {
    icon: "📋",
    label: "History",
    screen: "order-history",
    ocid: "nav.history.link",
  },
  { icon: "👤", label: "Profile", screen: "profile", ocid: "nav.profile.link" },
];

const RIDER_NAV: NavItem[] = [
  {
    icon: "🏍️",
    label: "Dashboard",
    screen: "rider-dashboard",
    ocid: "nav.dashboard.link",
  },
  {
    icon: "📦",
    label: "Active",
    screen: "rider-order",
    ocid: "nav.active.link",
  },
  {
    icon: "💰",
    label: "Earnings",
    screen: "rider-dashboard",
    ocid: "nav.earnings.link",
  },
  { icon: "👤", label: "Profile", screen: "profile", ocid: "nav.profile.link" },
];

interface Props {
  userRole: Role;
  activeScreen: Screen;
  onNav: (s: Screen) => void;
}

export default function BottomNav({ userRole, activeScreen, onNav }: Props) {
  const items = userRole === "customer" ? CUSTOMER_NAV : RIDER_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="max-w-md mx-auto flex">
        {items.map((item) => {
          const active = activeScreen === item.screen;
          return (
            <button
              type="button"
              key={item.ocid}
              data-ocid={item.ocid}
              onClick={() => onNav(item.screen)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-all ${
                active ? "" : "text-muted-foreground"
              }`}
              style={active ? { color: "#FF6B00" } : {}}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
