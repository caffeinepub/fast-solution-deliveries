import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppUser, Role } from "../types";

interface Props {
  role: Role;
  onSuccess: (user: AppUser) => void;
  onBack: () => void;
}

export default function AuthScreen({ role, onSuccess, onBack }: Props) {
  const [tab, setTab] = useState("signup");
  const [step, setStep] = useState<"form" | "otp" | "vehicle">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [disclaimer, setDisclaimer] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasTwoWheeler, setHasTwoWheeler] = useState<boolean | null>(null);
  const [servicePreference, setServicePreference] = useState<
    "metro" | "walking" | "bus" | null
  >(null);

  const handleSendOtp = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (phone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (role === "rider") {
      if (aadhaar.length !== 12) {
        toast.error("Aadhaar must be 12 digits");
        return;
      }
      if (pan.length !== 10) {
        toast.error("PAN must be 10 characters");
        return;
      }
      if (!disclaimer) {
        toast.error("Please accept the disclaimer to continue");
        return;
      }
    }
    toast.success(`OTP sent to ${phone}`);
    setStep("otp");
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 4) {
      toast.error("Enter the 4-digit OTP");
      return;
    }
    if (role === "rider") {
      setStep("vehicle");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ role, name, email, phone, aadhaar, pan });
      toast.success(`Welcome, ${name}!`);
    }, 800);
  };

  const handleVehicleConfirm = () => {
    if (hasTwoWheeler === null) {
      toast.error("Please answer the vehicle question");
      return;
    }
    if (!hasTwoWheeler && servicePreference === null) {
      toast.error("Please select your preferred service");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        role,
        name,
        email,
        phone,
        aadhaar,
        pan,
        riderVehicleType: hasTwoWheeler ? "two-wheeler" : "none",
        riderServicePreference: hasTwoWheeler
          ? undefined
          : (servicePreference ?? undefined),
      });
      toast.success(`Welcome aboard, ${name}!`);
    }, 800);
  };

  const handleLogin = () => {
    if (!email.trim() || !phone.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const mockName = role === "rider" ? "Amit Kumar" : "Priya Sharma";
      onSuccess({
        role,
        name: mockName,
        email,
        phone,
        aadhaar: role === "rider" ? "123456789012" : undefined,
        pan: role === "rider" ? "ABCDE1234F" : undefined,
        riderVehicleType: role === "rider" ? "two-wheeler" : undefined,
      });
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground"
        >
          <span>←</span> Back
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {role === "customer" ? "Customer" : "Rider"} Account
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {role === "rider"
              ? "Join as a delivery partner"
              : "Start sending parcels today"}
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v);
            setStep("form");
          }}
        >
          <TabsList className="w-full mb-6">
            <TabsTrigger
              value="signup"
              className="flex-1"
              data-ocid="auth.signup.tab"
            >
              Sign Up
            </TabsTrigger>
            <TabsTrigger
              value="login"
              className="flex-1"
              data-ocid="auth.login.tab"
            >
              Log In
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            {step === "form" && (
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    data-ocid="auth.name.input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    data-ocid="auth.email.input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    data-ocid="auth.phone.input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="mt-1"
                    maxLength={10}
                  />
                </div>

                {role === "rider" && (
                  <>
                    <div>
                      <Label>Aadhaar Number *</Label>
                      <Input
                        data-ocid="auth.aadhaar.input"
                        value={aadhaar}
                        onChange={(e) =>
                          setAadhaar(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="12-digit Aadhaar number"
                        className="mt-1"
                        maxLength={12}
                      />
                    </div>
                    <div>
                      <Label>PAN Number *</Label>
                      <Input
                        data-ocid="auth.pan.input"
                        value={pan}
                        onChange={(e) => setPan(e.target.value.toUpperCase())}
                        placeholder="10-character PAN (e.g. ABCDE1234F)"
                        className="mt-1"
                        maxLength={10}
                      />
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <p className="text-xs text-orange-800 font-medium mb-3">
                        ⚠️ Rider Disclaimer
                      </p>
                      <p className="text-xs text-orange-700 mb-3">
                        I understand that I operate as an independent service
                        provider. Fast Solution Deliveries provides no
                        insurance, accident claims, or employment benefits.
                      </p>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="disclaimer"
                          data-ocid="auth.disclaimer.checkbox"
                          checked={disclaimer}
                          onCheckedChange={(c) => setDisclaimer(c === true)}
                        />
                        <Label
                          htmlFor="disclaimer"
                          className="text-xs text-orange-800 cursor-pointer"
                        >
                          I have read and agree to the above disclaimer
                        </Label>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  data-ocid="auth.send_otp.button"
                  onClick={handleSendOtp}
                  className="w-full rounded-full text-white font-semibold py-5 mt-2"
                  style={{
                    background: "linear-gradient(90deg, #FF6B00, #FF9500)",
                  }}
                >
                  Send OTP
                </Button>
              </div>
            )}

            {step === "otp" && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Enter the 4-digit OTP sent to <strong>{phone}</strong>
                </p>
                <div>
                  <Label>OTP Code</Label>
                  <Input
                    data-ocid="auth.otp.input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="4-digit OTP"
                    className="mt-1 text-center text-2xl tracking-widest"
                    maxLength={4}
                  />
                </div>
                <Button
                  data-ocid="auth.verify_otp.button"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full rounded-full text-white font-semibold py-5"
                  style={{
                    background: "linear-gradient(90deg, #FF6B00, #FF9500)",
                  }}
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-sm text-muted-foreground underline text-center"
                >
                  Change details
                </button>
              </div>
            )}

            {step === "vehicle" && role === "rider" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-5"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🏍️</div>
                  <h3 className="font-bold text-lg">One more step!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tell us about your vehicle
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-sm mb-3">
                    Do you own a two-wheeler vehicle?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setHasTwoWheeler(true);
                        setServicePreference(null);
                      }}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        hasTwoWheeler === true
                          ? "border-orange-500 bg-orange-50"
                          : "border-border bg-card hover:border-orange-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">🏍️</div>
                      <p className="font-semibold text-sm">Yes</p>
                      <p className="text-xs text-muted-foreground">
                        2-Wheeler Rider
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasTwoWheeler(false)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        hasTwoWheeler === false
                          ? "border-orange-500 bg-orange-50"
                          : "border-border bg-card hover:border-orange-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">🚶</div>
                      <p className="font-semibold text-sm">No</p>
                      <p className="text-xs text-muted-foreground">
                        Choose a service
                      </p>
                    </button>
                  </div>
                </div>

                {hasTwoWheeler === false && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="font-semibold text-sm mb-3">
                      Select your preferred delivery service:
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "metro" as const, icon: "🚇", label: "Metro" },
                        {
                          id: "walking" as const,
                          icon: "🚶",
                          label: "Walking",
                        },
                        { id: "bus" as const, icon: "🚌", label: "Bus" },
                      ].map((s) => (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => setServicePreference(s.id)}
                          className={`p-3 rounded-2xl border-2 text-center transition-all ${
                            servicePreference === s.id
                              ? "border-orange-500 bg-orange-50"
                              : "border-border bg-card hover:border-orange-300"
                          }`}
                        >
                          <div className="text-2xl mb-1">{s.icon}</div>
                          <p className="font-semibold text-xs">{s.label}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <Button
                  data-ocid="auth.vehicle_confirm.button"
                  onClick={handleVehicleConfirm}
                  disabled={loading}
                  className="w-full rounded-full text-white font-semibold py-5"
                  style={{
                    background: "linear-gradient(90deg, #FF6B00, #FF9500)",
                  }}
                >
                  {loading ? "Setting up..." : "Complete Registration"}
                </Button>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="login">
            <div className="flex flex-col gap-4">
              <div>
                <Label>Email Address</Label>
                <Input
                  data-ocid="auth.login_email.input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  data-ocid="auth.login_phone.input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="mt-1"
                  maxLength={10}
                />
              </div>
              <Button
                data-ocid="auth.login.button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-full text-white font-semibold py-5 mt-2"
                style={{
                  background: "linear-gradient(90deg, #FF6B00, #FF9500)",
                }}
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
