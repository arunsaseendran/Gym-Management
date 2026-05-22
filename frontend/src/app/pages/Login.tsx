import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame, Key, User, Mail, Phone, Cpu,
  AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff,
  Dumbbell, ChevronRight, CreditCard, Shield, Star, Zap, Crown,
  Lock, X, Landmark, Wallet, QrCode, Globe, Check
} from "lucide-react";
import { api } from "../store/api";

const DISPLAY = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };

// ── Plan definitions (keep in sync with backend PLAN_PRICES) ─────────────────
const PLANS = [
  {
    key: "standard_monthly",
    label: "Standard Monthly",
    price: 999,
    period: "/ month",
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    activeBorder: "border-amber-400",
    features: ["Gym access", "Locker room", "Basic support"],
  },
  {
    key: "elite_quarterly",
    label: "Elite Quarterly",
    price: 2499,
    period: "/ 3 months",
    icon: Zap,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    activeBorder: "border-indigo-400",
    features: ["All Standard", "Personal trainer", "Nutrition plan"],
    popular: true,
  },
  {
    key: "premium_annual",
    label: "Premium Annual",
    price: 6999,
    period: "/ year",
    icon: Crown,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    activeBorder: "border-emerald-400",
    features: ["All Elite", "Priority booking", "Guest passes"],
  },
] as const;

type PlanKey = typeof PLANS[number]["key"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function FieldGroup({ label, error, touched, children }: { label: string; error?: string; touched?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
      {touched && error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-[10px] font-medium text-rose-500 mt-1 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" /> <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}

function InputIcon({ icon: Icon, ...rest }: { icon: any; [k: string]: any }) {
  const [show, setShow] = useState(false);
  const isPass = rest.type === "password";
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        {...rest}
        type={isPass ? (show ? "text" : "password") : rest.type}
        className="input-base pl-10 pr-10"
      />
      {isPass && (
        <button type="button" onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

// ── Load Razorpay script ───────────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (api.getSession()) navigate("/portal/overview");
    // Pre-load Razorpay script in background
    loadRazorpayScript();
  }, [navigate]);

  // Page state
  const [mode, setMode] = useState<"login" | "register">("login");
  // register has 2 steps: "form" → "payment"
  const [regStep, setRegStep] = useState<"form" | "payment">("form");

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Biometrics
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [targetWeight, setTargetWeight] = useState<number | "">("");
  const [calorieTarget, setCalorieTarget] = useState<number | "">("");
  const [plan, setPlan] = useState<PlanKey>("standard_monthly");

  const [idealWeight, setIdealWeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof height === "number" && height > 50 && typeof weight === "number" && weight > 20 && typeof age === "number" && age >= 10) {
      // 1. Calculate Ideal Weight
      const heightInM = height / 100;
      const calcIdeal = 22 * (heightInM * heightInM);
      setIdealWeight(Math.round(calcIdeal));

      // 2. Calculate BMR & Calories
      let bmr = (10 * weight) + (6.25 * height) - (5 * age);
      bmr = gender === "male" ? bmr + 5 : bmr - 161;

      let maintenance = bmr * 1.5;
      let calTarget = maintenance;

      if (typeof targetWeight === "number" && targetWeight > 0) {
        if (targetWeight < weight) calTarget -= 500;
        else if (targetWeight > weight) calTarget += 300;
      }

      setCalorieTarget(Math.round(calTarget));
      setErrors(prev => ({ ...prev, calorieTarget: "" }));
    } else {
      setIdealWeight(null);
    }
  }, [age, gender, height, weight, targetWeight]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, val: any) => {
    let err = "";
    if (field === "firstName" && !val) err = "First name is required.";
    else if (field === "lastName" && !val) err = "Last name is required.";
    else if (field === "username" && !val) err = "Username is required.";
    else if (field === "password" && (!val || String(val).length < 6)) err = "Password must be at least 6 characters.";
    else if (field === "email") {
      if (!val) err = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(String(val))) err = "Invalid email format.";
    }
    else if (field === "phone") {
      if (!val) err = "Phone number is required.";
      else if (!/^\+?[0-9]{10,14}$/.test(String(val).replace(/\s/g, ''))) err = "Invalid phone format.";
    }
    else if (field === "age" && (val === "" || val < 10 || val > 100)) err = "Age must be 10-100.";
    else if (field === "height" && (val === "" || val < 50 || val > 300)) err = "Invalid height.";
    else if (field === "weight" && (val === "" || val < 20 || val > 300)) err = "Invalid weight.";
    else if (field === "targetWeight" && (val === "" || val < 20 || val > 300)) err = "Invalid target weight.";
    else if (field === "calorieTarget" && (val === "" || val < 500 || val > 10000)) err = "Invalid calorie target.";

    setErrors(prev => ({ ...prev, [field]: err }));
    return err === "";
  };

  const checkAvailability = async (field: "username" | "email", val: string) => {
    if (!val || errors[field]) return;
    try {
      const res = await api.auth.checkAvailability({ [field]: val });
      if (!res.available) {
        setErrors(prev => ({ ...prev, [field]: res.error }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlur = (field: string, val: any) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const isValid = validateField(field, val);
    if (isValid && (field === "username" || field === "email")) {
      checkAvailability(field, val);
    }
  };

  const handleChange = (field: string, val: any, setter: any) => {
    setter(val);
    if (touched[field]) validateField(field, val);
  };

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const selectedPlan = PLANS.find(p => p.key === plan)!;

  // Mock Payment Sandbox state
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [activePaymentMethod, setActivePaymentMethod] = useState<"card" | "upi" | "netbanking" | "wallet">("card");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(""); setSuccessMsg("");
    try {
      const session = await api.auth.login(username, password);
      setSuccessMsg(`Welcome back, ${session.name}!`);
      setTimeout(() => navigate("/portal/overview"), 700);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: validate form → proceed to payment ─────────────────────────────
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTouched = {
      firstName: true, lastName: true, username: true, password: true, email: true,
      phone: true, age: true, height: true, weight: true, targetWeight: true, calorieTarget: true
    };
    setTouched(prev => ({ ...prev, ...newTouched }));

    const fValid = validateField("firstName", firstName);
    const lValid = validateField("lastName", lastName);
    const uValid = validateField("username", username);
    const pValid = validateField("password", password);
    const eValid = validateField("email", email);
    const phValid = validateField("phone", phone);
    const aValid = validateField("age", age);
    const hValid = validateField("height", height);
    const wValid = validateField("weight", weight);
    const twValid = validateField("targetWeight", targetWeight);
    const ctValid = validateField("calorieTarget", calorieTarget);

    if (!(fValid && lValid && uValid && pValid && eValid && phValid && aValid && hValid && wValid && twValid && ctValid)) {
      setErrorMsg("Please fix the validation errors below."); return;
    }

    setLoading(true);
    try {
      const res = await api.auth.checkAvailability({ username, email });
      if (!res.available) {
        setErrorMsg(res.error);
        if (res.error.toLowerCase().includes("username")) setErrors(prev => ({ ...prev, username: res.error }));
        if (res.error.toLowerCase().includes("email") || res.error.toLowerCase().includes("registered")) setErrors(prev => ({ ...prev, email: res.error }));
        setLoading(false);
        return;
      }
    } catch (err) {
      setErrorMsg("Error verifying uniqueness. Please try again.");
      setLoading(false);
      return;
    }
    setLoading(false);
    
    setErrorMsg("");
    setRegStep("payment");
  };

  // ── Step 2: Razorpay payment → register account ────────────────────────────
  const handlePayAndRegister = async () => {
    setLoading(true); setErrorMsg("");
    try {
      // Create order on backend
      const orderRes = await api.payments.createOrder({
        plan,
        name: `${firstName} ${lastName}`,
        email,
      });

      if (orderRes.is_mock) {
        setMockOrderDetails({
          order_id: orderRes.order_id,
          amount: orderRes.amount,
          currency: orderRes.currency,
          key_id: orderRes.key_id,
        });
        setShowMockModal(true);
        setLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Could not load Razorpay. Check your internet connection.");

      const options: any = {
        key: orderRes.key_id,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "SmartGYM",
        description: selectedPlan.label,
        order_id: orderRes.order_id,
        prefill: {
          name: `${firstName} ${lastName}`,
          email,
          contact: phone,
        },
        theme: { color: "#f59e0b" },
        handler: async (response: any) => {
          setLoading(true);
          try {
            // Verify payment on backend
            await api.payments.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Payment verified → create account
            const payload: any = {
              username,
              password,
              email,
              first_name: firstName,
              last_name: lastName,
              role: "member",
              phone,
              member_profile: {
                age,
                gender,
                height_cm: height,
                weight_kg: weight,
                target_weight_kg: targetWeight,
                calorie_target: calorieTarget,
                membership_plan: plan,
                membership_validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              },
            };
            await api.auth.register(payload);
            setSuccessMsg("Payment successful! Account created. Please sign in.");
            setRegStep("form");
            setMode("login");
            setPassword("");
          } catch (err: any) {
            setErrorMsg("Payment verified but account creation failed: " + err.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => { setLoading(false); },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        setErrorMsg("Payment failed: " + (resp.error?.description || "Unknown error"));
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      setErrorMsg(err.message || "Payment initiation failed.");
      setLoading(false);
    }
  };

  const startSimulatedPayment = () => {
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("success");
      setTimeout(() => {
        handleConfirmMockPayment();
      }, 1800);
    }, 2000);
  };

  const handleConfirmMockPayment = async (customPayId?: string, customSig?: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const mockPayId = customPayId || `pay_mock_${Math.random().toString(36).substring(2, 14)}`;
      const mockSig = customSig || `sig_mock_${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;

      // Verify payment on backend
      await api.payments.verifyPayment({
        razorpay_order_id: mockOrderDetails.order_id,
        razorpay_payment_id: mockPayId,
        razorpay_signature: mockSig,
      });

      // Payment verified → create account
      const payload: any = {
        username,
        password,
        email,
        first_name: firstName,
        last_name: lastName,
        role: "member",
        phone,
        member_profile: {
          age,
          gender,
          height_cm: height,
          weight_kg: weight,
          target_weight_kg: targetWeight,
          calorie_target: calorieTarget,
          membership_plan: plan,
          membership_validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
      };
      await api.auth.register(payload);
      setSuccessMsg("Payment successful! Account created. Please sign in.");
      setShowMockModal(false);
      setMockOrderDetails(null);
      setRegStep("form");
      setMode("login");
      setPassword("");
    } catch (err: any) {
      setErrorMsg("Payment verified but account creation failed: " + err.message);
      setShowMockModal(false);
    } finally {
      setLoading(false);
      setPaymentStatus("idle");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-background flex overflow-hidden">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(238,242,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(238,242,255,0.025) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }} />
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 gradient-amber rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
            style={{ boxShadow: "0 0 60px rgba(245,158,11,0.35)" }}>
            <Flame className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-6xl xl:text-7xl font-black mb-4" style={DISPLAY}>
            SMART<span className="text-amber-400">GYM</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-12 max-w-sm">
            AI-Powered Gym Management & Calorie Prediction Platform
          </p>
          {[
            { icon: Cpu, label: "ML Calorie Prediction", color: "text-amber-400", bg: "bg-amber-400/10" },
            { icon: Dumbbell, label: "Smart Workout Tracking", color: "text-indigo-400", bg: "bg-indigo-400/10" },
            { icon: ChevronRight, label: "Real-time Analytics", color: "text-emerald-400", bg: "bg-emerald-400/10" },
          ].map((item, i) => (
            <motion.div key={i} className="flex items-center gap-3 text-left mb-4"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12 }}>
              <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-foreground/80">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 gradient-amber rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-black" />
            </div>
            <span className="text-2xl font-black" style={DISPLAY}>SMART<span className="text-amber-400">GYM</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black mb-1" style={DISPLAY}>
              {mode === "login" ? "Welcome back" : regStep === "form" ? "Create account" : "Complete Payment"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to access your dashboard and track your progress."
                : regStep === "form"
                ? "Register as a member and start your fitness journey."
                : "Secure checkout powered by Razorpay."}
            </p>
          </div>

          {/* Mode Toggle */}
          {regStep === "form" && (
            <div className="flex p-1 bg-muted rounded-xl mb-8 border border-border">
              {(["login", "register"] as const).map((m) => (
                <button key={m} type="button"
                  onClick={() => { setMode(m); setErrorMsg(""); setSuccessMsg(""); setRegStep("form"); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    mode === m ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
          )}

          {/* Alerts */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div className="flex items-start gap-3 p-3.5 rounded-xl border border-destructive/25 bg-destructive/8 mb-5"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <span className="text-sm text-destructive">{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8 mb-5"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm text-emerald-400">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <FieldGroup label="Username">
                <InputIcon icon={User} type="text" value={username} onChange={(e: any) => setUsername(e.target.value)} required />
              </FieldGroup>
              <FieldGroup label="Password">
                <InputIcon icon={Key} type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required />
              </FieldGroup>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2"
                style={{ boxShadow: loading ? "none" : "0 0 28px rgba(245,158,11,0.25)" }}>
                {loading ? <span className="spinner w-5 h-5 border-2 border-black/30 border-t-black" /> : <><Flame className="w-5 h-5" /> Sign In to Dashboard</>}
              </button>
            </form>
          )}

          {/* ── REGISTER STEP 1: FORM ── */}
          {mode === "register" && regStep === "form" && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label="First Name" error={errors.firstName} touched={touched.firstName}>
                  <input className="input-base" value={firstName} onChange={e => handleChange("firstName", e.target.value, setFirstName)} onBlur={e => handleBlur("firstName", e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Last Name" error={errors.lastName} touched={touched.lastName}>
                  <input className="input-base" value={lastName} onChange={e => handleChange("lastName", e.target.value, setLastName)} onBlur={e => handleBlur("lastName", e.target.value)} />
                </FieldGroup>
              </div>

              <FieldGroup label="Username" error={errors.username} touched={touched.username}>
                <InputIcon icon={User} type="text" value={username} onChange={(e: any) => handleChange("username", e.target.value, setUsername)} onBlur={(e: any) => handleBlur("username", e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Password" error={errors.password} touched={touched.password}>
                <InputIcon icon={Key} type="password" value={password} onChange={(e: any) => handleChange("password", e.target.value, setPassword)} onBlur={(e: any) => handleBlur("password", e.target.value)} />
              </FieldGroup>
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label="Email" error={errors.email} touched={touched.email}>
                  <InputIcon icon={Mail} type="email" value={email} onChange={(e: any) => handleChange("email", e.target.value, setEmail)} onBlur={(e: any) => handleBlur("email", e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Phone" error={errors.phone} touched={touched.phone}>
                  <InputIcon icon={Phone} type="text" value={phone} onChange={(e: any) => handleChange("phone", e.target.value, setPhone)} onBlur={(e: any) => handleBlur("phone", e.target.value)} required />
                </FieldGroup>
              </div>

              {/* Biometrics */}
              <div className="border-t border-border pt-4 mt-2">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Biometric Profile</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <FieldGroup label="Age" error={errors.age} touched={touched.age}>
                    <input className="input-base" type="number" value={age} onChange={e => handleChange("age", parseInt(e.target.value) || "", setAge)} onBlur={e => handleBlur("age", parseInt(e.target.value) || "")} min={10} max={100} required />
                  </FieldGroup>
                  <FieldGroup label="Height (cm)" error={errors.height} touched={touched.height}>
                    <input className="input-base" type="number" value={height} onChange={e => handleChange("height", parseFloat(e.target.value) || "", setHeight)} onBlur={e => handleBlur("height", parseFloat(e.target.value) || "")} required />
                  </FieldGroup>
                  <FieldGroup label="Weight (kg)" error={errors.weight} touched={touched.weight}>
                    <input className="input-base" type="number" value={weight} onChange={e => handleChange("weight", parseFloat(e.target.value) || "", setWeight)} onBlur={e => handleBlur("weight", parseFloat(e.target.value) || "")} required />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <FieldGroup label="Gender">
                    <select className="input-base" value={gender} onChange={e => setGender(e.target.value)}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Target Wt (kg)" error={errors.targetWeight} touched={touched.targetWeight}>
                    <input className="input-base" type="number" value={targetWeight} onChange={e => handleChange("targetWeight", parseFloat(e.target.value) || "", setTargetWeight)} onBlur={e => handleBlur("targetWeight", parseFloat(e.target.value) || "")} required />
                    {idealWeight && (
                      <div className="text-[10px] text-emerald-500 font-semibold leading-tight mt-1">Ideal healthy weight: ~{idealWeight} kg</div>
                    )}
                  </FieldGroup>
                </div>
                <div className="mt-3">
                  <FieldGroup label="Daily Calorie Target (kcal)" error={errors.calorieTarget} touched={touched.calorieTarget}>
                    <input className="input-base" type="number" value={calorieTarget} onChange={e => handleChange("calorieTarget", parseInt(e.target.value) || "", setCalorieTarget)} onBlur={e => handleBlur("calorieTarget", parseInt(e.target.value) || "")} required />
                    {idealWeight && calorieTarget !== "" && (
                      <div className="text-[10px] text-amber-500 font-semibold leading-tight mt-1">AI auto-calculated based on your metrics</div>
                    )}
                  </FieldGroup>
                </div>
              </div>

              {/* ── Membership Plan Dropdown ── */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Membership Plan</span>
                </div>
                <div className="space-y-2">
                  {PLANS.map(p => {
                    const Icon = p.icon;
                    const isSelected = plan === p.key;
                    return (
                      <button key={p.key} type="button" onClick={() => setPlan(p.key)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? `${p.bg} ${p.activeBorder} shadow-md`
                            : "border-border bg-muted/30 hover:border-border hover:bg-muted/60"
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? p.bg : "bg-muted"}`}>
                            <Icon className={`w-4 h-4 ${isSelected ? p.color : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                {p.label}
                              </span>
                              {p.popular && (
                                <span className="text-[9px] font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {p.features.join(" · ")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className={`text-base font-black ${isSelected ? p.color : "text-muted-foreground"}`} style={DISPLAY}>
                            ₹{p.price.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{p.period}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3.5 text-base mt-2"
                style={{ boxShadow: "0 0 28px rgba(245,158,11,0.25)" }}>
                <CreditCard className="w-5 h-5" /> Continue to Payment
              </button>
            </form>
          )}

          {/* ── REGISTER STEP 2: PAYMENT CONFIRMATION ── */}
          {mode === "register" && regStep === "payment" && (
            <motion.div className="space-y-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {/* Order Summary */}
              <div className={`card-base p-5 border-2 ${selectedPlan.activeBorder} ${selectedPlan.bg}`}>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Order Summary</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPlan.bg}`}>
                      <selectedPlan.icon className={`w-5 h-5 ${selectedPlan.color}`} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{selectedPlan.label}</div>
                      <div className="text-xs text-muted-foreground">{selectedPlan.features.join(" · ")}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${selectedPlan.color}`} style={DISPLAY}>
                      ₹{selectedPlan.price.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{selectedPlan.period}</div>
                  </div>
                </div>
                <div className="border-t border-border/50 mt-4 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Member</span><span className="text-foreground font-medium">{firstName} {lastName}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Username</span><span className="text-foreground font-medium font-mono">{username}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Email</span><span className="text-foreground font-medium">{email}</span>
                  </div>
                </div>
              </div>

              {/* Razorpay trust badge */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-muted-foreground leading-snug">
                  Your payment is secured by <strong className="text-foreground">Razorpay</strong> with 256-bit SSL encryption. We never store your card details.
                </p>
              </div>

              <button onClick={handlePayAndRegister} disabled={loading}
                className="btn-primary w-full py-4 text-base font-bold"
                style={{ boxShadow: loading ? "none" : "0 0 32px rgba(245,158,11,0.3)" }}>
                {loading ? (
                  <span className="spinner w-5 h-5 border-2 border-black/30 border-t-black" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay ₹{selectedPlan.price.toLocaleString("en-IN")} via Razorpay
                  </>
                )}
              </button>

              <button type="button" onClick={() => { setRegStep("form"); setErrorMsg(""); }}
                className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                <ArrowLeft className="w-4 h-4" /> Back to edit details
              </button>
            </motion.div>
          )}

          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
            <button onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </button>
            <p className="text-xs text-muted-foreground">
              Demo: <span className="text-amber-400 font-mono">admin / admin123</span>
            </p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showMockModal && mockOrderDetails && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Inline CSS styling for the scanner bar */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scan {
                0% { top: 5%; }
                50% { top: 95%; }
                100% { top: 5%; }
              }
            `}} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl h-[580px] overflow-hidden flex flex-col md:flex-row relative"
              style={{ boxShadow: "0 0 60px rgba(23, 104, 228, 0.15)" }}
            >
              {/* ── FULL SCREEN MODAL STATES ── */}
              
              {/* 1. PROCESSING / LOADER STATE */}
              {paymentStatus === "processing" && (
                <div className="absolute inset-0 bg-zinc-950 z-50 flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-[#1768E4]/20 border-t-[#1768E4] animate-spin" />
                    <Flame className="w-10 h-10 text-amber-500 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Processing Payment securely...</h3>
                  <p className="text-sm text-zinc-400 mt-2 max-w-xs">Do not close this window or click back. Contacting sandbox server.</p>
                </div>
              )}

              {/* 2. SUCCESS CHECKMARK STATE */}
              {paymentStatus === "success" && (
                <div className="absolute inset-0 bg-zinc-950 z-50 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-24 h-24 text-emerald-500 mx-auto mb-6">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <motion.circle 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        initial={{ pathLength: 0 }} 
                        animate={{ pathLength: 1 }} 
                        transition={{ duration: 0.6, ease: "easeOut" }} 
                      />
                      <motion.path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M9 12l2 2 4-4" 
                        initial={{ pathLength: 0 }} 
                        animate={{ pathLength: 1 }} 
                        transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }} 
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-emerald-400 tracking-tight" style={DISPLAY}>PAYMENT SUCCESSFUL</h3>
                  <p className="text-sm text-zinc-300 mt-2">Redirection & Account Creation in progress...</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest mt-4">
                    Ref: {mockOrderDetails.order_id.replace("order_", "pay_")}
                  </span>
                </div>
              )}

              {/* ── LEFT COLUMN: RAZORPAY BILLING INFO ── */}
              <div className="w-full md:w-2/5 bg-gradient-to-b from-[#1768E4] to-[#1E3A8A] p-6 flex flex-col justify-between text-white relative">
                {/* Visual grid background */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                <div>
                  <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <Flame className="w-5.5 h-5.5 text-[#1768E4]" />
                    </div>
                    <div>
                      <span className="text-lg font-black tracking-tight" style={DISPLAY}>SMARTGYM</span>
                      <p className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold -mt-1">Merchant Portal</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-blue-200 block font-medium">MEMBERSHIP PLAN</span>
                      <span className="text-lg font-bold tracking-tight text-white">{selectedPlan.label}</span>
                    </div>
                    <div>
                      <span className="text-xs text-blue-200 block font-medium">ORDER ID</span>
                      <span className="text-xs font-mono text-blue-100">{mockOrderDetails.order_id}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="mb-4">
                    <span className="text-xs text-blue-200 block font-medium">TOTAL PAYABLE AMOUNT</span>
                    <span className="text-4xl font-black text-white" style={DISPLAY}>
                      ₹{selectedPlan.price.toLocaleString("en-IN")}.00
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-blue-100 font-medium bg-white/5 border border-white/10 p-2.5 rounded-xl">
                    <Shield className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Razorpay Secure checkout. Encrypted with 256-bit SSL technology.</span>
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN: PAYMENT METHODS & FORM ── */}
              <div className="w-full md:w-3/5 bg-zinc-950 p-6 flex flex-col justify-between relative">
                
                {/* Upper bar & close */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-black uppercase text-amber-400 tracking-widest">Razorpay Sandbox</span>
                  </div>
                  <button 
                    onClick={() => { setShowMockModal(false); setLoading(false); }}
                    className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Split Center content: Navigation and active forms */}
                <div className="flex-1 flex gap-4 overflow-hidden mb-4">
                  {/* Vertical Tabs Sidebar */}
                  <div className="w-1/3 flex flex-col gap-1.5 border-r border-zinc-800/50 pr-3">
                    {[
                      { key: "card", label: "Card", icon: CreditCard },
                      { key: "upi", label: "UPI / QR", icon: QrCode },
                      { key: "netbanking", label: "Netbanking", icon: Landmark },
                      { key: "wallet", label: "Wallet", icon: Wallet }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = activePaymentMethod === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActivePaymentMethod(tab.key as any)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                            isActive
                              ? "bg-[#1768E4] text-white shadow-lg"
                              : "text-zinc-400 bg-zinc-900/40 hover:bg-zinc-900 hover:text-zinc-200"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment Details Form */}
                  <div className="w-2/3 overflow-y-auto pr-1">
                    
                    {/* A. CARD FORM */}
                    {activePaymentMethod === "card" && (
                      <div className="space-y-3.5">
                        <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Pay via Credit/Debit Card</h4>
                        <div className="space-y-3">
                          <FieldGroup label="Card Number">
                            <input 
                              className="input-base font-mono text-sm" 
                              type="text" 
                              placeholder="4111 1111 1111 4242" 
                              maxLength={19} 
                              value={cardNumber}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, "");
                                setCardNumber(val);
                              }}
                              required 
                            />
                          </FieldGroup>
                          <div className="grid grid-cols-2 gap-3">
                            <FieldGroup label="Expiry Date">
                              <input 
                                className="input-base font-mono text-sm" 
                                type="text" 
                                placeholder="MM/YY" 
                                maxLength={5} 
                                value={cardExpiry}
                                onChange={e => {
                                  let val = e.target.value.replace(/\D/g, "");
                                  if (val.length > 2) val = `${val.slice(0,2)}/${val.slice(2,4)}`;
                                  setCardExpiry(val);
                                }}
                                required 
                              />
                            </FieldGroup>
                            <FieldGroup label="CVV">
                              <input 
                                className="input-base font-mono text-sm" 
                                type="password" 
                                placeholder="•••" 
                                maxLength={3} 
                                value={cardCvv}
                                onChange={e => setCardCvv(e.target.value.replace(/\D/g, ""))}
                                required 
                              />
                            </FieldGroup>
                          </div>
                          <FieldGroup label="Cardholder Name">
                            <input 
                              className="input-base text-sm" 
                              type="text" 
                              placeholder="Rahul Sharma" 
                              value={cardHolder || `${firstName} ${lastName}`}
                              onChange={e => setCardHolder(e.target.value)}
                              required 
                            />
                          </FieldGroup>
                        </div>
                      </div>
                    )}

                    {/* B. UPI / QR FORM */}
                    {activePaymentMethod === "upi" && (
                      <div className="space-y-3.5 text-center">
                        <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider text-left">Pay via UPI QR Code</h4>
                        
                        {/* High Fidelity QR Code Container */}
                        <div className="relative w-40 h-40 mx-auto bg-white p-3 rounded-2xl border border-zinc-200 shadow-xl overflow-hidden flex items-center justify-center">
                          {/* Animated Scan Line */}
                          <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399] top-0 animate-[scan_2.5s_infinite]" />
                          
                          {/* Perfect Vector QR Representation */}
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <rect x="5" y="5" width="25" height="25" fill="black" />
                            <rect x="10" y="10" width="15" height="15" fill="white" />
                            <rect x="12" y="12" width="11" height="11" fill="black" />
                            
                            <rect x="70" y="5" width="25" height="25" fill="black" />
                            <rect x="75" y="10" width="15" height="15" fill="white" />
                            <rect x="77" y="12" width="11" height="11" fill="black" />
                            
                            <rect x="5" y="70" width="25" height="25" fill="black" />
                            <rect x="10" y="75" width="15" height="15" fill="white" />
                            <rect x="12" y="77" width="11" height="11" fill="black" />
                            
                            <rect x="35" y="5" width="5" height="10" fill="black" />
                            <rect x="45" y="5" width="10" height="5" fill="black" />
                            <rect x="60" y="5" width="5" height="15" fill="black" />
                            <rect x="35" y="20" width="15" height="5" fill="black" />
                            <rect x="55" y="20" width="5" height="5" fill="black" />
                            
                            <rect x="5" y="35" width="10" height="5" fill="black" />
                            <rect x="20" y="35" width="5" height="10" fill="black" />
                            <rect x="30" y="30" width="15" height="5" fill="black" />
                            <rect x="50" y="30" width="5" height="15" fill="black" />
                            <rect x="60" y="30" width="10" height="5" fill="black" />
                            <rect x="75" y="35" width="20" height="5" fill="black" />
                            
                            <rect x="5" y="50" width="15" height="5" fill="black" />
                            <rect x="25" y="45" width="5" height="15" fill="black" />
                            <rect x="35" y="45" width="10" height="5" fill="black" />
                            <rect x="50" y="50" width="15" height="5" fill="black" />
                            <rect x="70" y="45" width="5" height="10" fill="black" />
                            <rect x="80" y="50" width="15" height="5" fill="black" />
                            
                            <rect x="35" y="60" width="5" height="15" fill="black" />
                            <rect x="45" y="65" width="15" height="5" fill="black" />
                            <rect x="65" y="60" width="5" height="5" fill="black" />
                            <rect x="75" y="65" width="20" height="5" fill="black" />
                            
                            <rect x="35" y="80" width="20" height="5" fill="black" />
                            <rect x="60" y="75" width="5" height="15" fill="black" />
                            <rect x="70" y="80" width="10" height="5" fill="black" />
                            <rect x="85" y="75" width="10" height="10" fill="black" />
                            
                            <rect x="40" y="40" width="20" height="20" fill="white" rx="3" />
                            <path d="M47 54 C47 54 46 51 48 49 C50 47 52 45 52 43 C52 43 54 45 53 48 C55 49 55 52 53 54 C51 56 47 56 47 54 Z" fill="#1768E4" />
                          </svg>
                        </div>
                        
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Scan QR using any BHIM UPI enabled app (GPay, PhonePe, Paytm).
                        </p>

                        <div className="relative flex items-center my-2">
                          <div className="flex-grow border-t border-zinc-800" />
                          <span className="flex-shrink mx-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Or Pay via UPI ID</span>
                          <div className="flex-grow border-t border-zinc-800" />
                        </div>

                        <input 
                          className="input-base text-center font-mono text-xs py-2" 
                          type="text" 
                          placeholder="username@upi"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                        />
                      </div>
                    )}

                    {/* C. NETBANKING FORM */}
                    {activePaymentMethod === "netbanking" && (
                      <div className="space-y-3.5">
                        <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Select Bank Account</h4>
                        
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {[
                            "SBI (State Bank)", "HDFC Bank",
                            "ICICI Bank", "Axis Bank",
                            "Kotak Bank", "Yes Bank"
                          ].map(bank => {
                            const isSelected = selectedBank === bank;
                            return (
                              <button
                                key={bank}
                                type="button"
                                onClick={() => setSelectedBank(bank)}
                                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                                  isSelected
                                    ? "bg-[#1768E4]/10 border-[#1768E4] text-[#1768E4]"
                                    : "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                                }`}
                              >
                                <span>{bank}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#1768E4]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* D. WALLET FORM */}
                    {activePaymentMethod === "wallet" && (
                      <div className="space-y-3.5">
                        <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Select Wallet Portal</h4>
                        
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {[
                            "Paytm Wallet", "PhonePe Wallet",
                            "Amazon Pay", "Mobikwik"
                          ].map(wallet => {
                            const isSelected = selectedWallet === wallet;
                            return (
                              <button
                                key={wallet}
                                type="button"
                                onClick={() => setSelectedWallet(wallet)}
                                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                                  isSelected
                                    ? "bg-[#1768E4]/10 border-[#1768E4] text-[#1768E4]"
                                    : "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                                }`}
                              >
                                <span>{wallet}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#1768E4]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Action payment footer buttons */}
                <div>
                  <button 
                    onClick={startSimulatedPayment} 
                    type="button"
                    className="w-full bg-[#1768E4] hover:bg-[#1E6BDB] active:scale-[0.99] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all text-sm uppercase tracking-wider"
                    style={{ boxShadow: "0 0 24px rgba(23, 104, 228, 0.3)" }}
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay ₹{selectedPlan.price.toLocaleString("en-IN")} securely
                  </button>

                  <div className="flex items-center justify-between mt-3 text-[9px] text-zinc-500 font-medium">
                    <span>⚡ Powered by Razorpay Sandbox</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> PCI-DSS Compliant</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
