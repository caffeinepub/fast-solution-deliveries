import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AuthScreen from "./screens/AuthScreen";
import BookingConfirmation from "./screens/BookingConfirmation";
import CustomerHome from "./screens/CustomerHome";
import OrderHistory from "./screens/OrderHistory";
import OrderTracking from "./screens/OrderTracking";
import ProfileScreen from "./screens/ProfileScreen";
import RiderDashboard from "./screens/RiderDashboard";
import RiderOrderDetail from "./screens/RiderOrderDetail";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";
import SplashScreen from "./screens/SplashScreen";
import type { AppUser, BookingData, Role, Screen } from "./types";

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [authRole, setAuthRole] = useState<Role>("customer");
  const [user, setUser] = useState<AppUser | null>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [activeRiderOrder, setActiveRiderOrder] = useState<BookingData | null>(
    null,
  );

  const navigate = (s: Screen) => setScreen(s);

  const handleRoleSelect = (role: Role) => {
    setAuthRole(role);
    navigate("auth");
  };

  const handleAuthSuccess = (u: AppUser) => {
    setUser(u);
    navigate(u.role === "customer" ? "customer-home" : "rider-dashboard");
  };

  const handleBookingConfirm = (b: BookingData) => {
    setBooking(b);
    navigate("booking-confirm");
  };

  const handleRiderOrderSelect = (b: BookingData) => {
    setActiveRiderOrder(b);
    navigate("rider-order");
  };

  const handleLogout = () => {
    setUser(null);
    setBooking(null);
    navigate("role");
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      {screen === "splash" && <SplashScreen onDone={() => navigate("role")} />}
      {screen === "role" && <RoleSelectionScreen onSelect={handleRoleSelect} />}
      {screen === "auth" && (
        <AuthScreen
          role={authRole}
          onSuccess={handleAuthSuccess}
          onBack={() => navigate("role")}
        />
      )}
      {screen === "customer-home" && user && (
        <CustomerHome
          user={user}
          onBook={handleBookingConfirm}
          onNav={navigate}
        />
      )}
      {screen === "booking-confirm" && booking && user && (
        <BookingConfirmation
          booking={booking}
          onTrack={() => navigate("order-tracking")}
          onHome={() => navigate("customer-home")}
          onNav={navigate}
          user={user}
        />
      )}
      {screen === "order-tracking" && booking && user && (
        <OrderTracking booking={booking} onNav={navigate} user={user} />
      )}
      {screen === "order-history" && user && (
        <OrderHistory onNav={navigate} user={user} currentBooking={booking} />
      )}
      {screen === "rider-dashboard" && user && (
        <RiderDashboard
          user={user}
          onOrderSelect={handleRiderOrderSelect}
          onNav={navigate}
        />
      )}
      {screen === "rider-order" && activeRiderOrder && user && (
        <RiderOrderDetail
          order={activeRiderOrder}
          user={user}
          onBack={() => navigate("rider-dashboard")}
          onNav={navigate}
        />
      )}
      {screen === "profile" && user && (
        <ProfileScreen user={user} onLogout={handleLogout} onNav={navigate} />
      )}
    </div>
  );
}
