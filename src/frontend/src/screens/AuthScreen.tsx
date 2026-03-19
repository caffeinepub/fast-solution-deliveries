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
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [disclaimer, setDisclaimer] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ role, name, email, phone, aadhaar, pan });
      toast.success(`Welcome, ${name}!`);
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

        <Tabs value={tab} onValueChange={setTab}>
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
            {step === "form" ? (
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
            ) : (
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
