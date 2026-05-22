import { useNavigate } from "react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect } from "react";
import {
  Flame, Brain, QrCode, Calendar, BarChart3,
  ArrowRight, Zap, Users, Trophy, CheckCircle, Dumbbell,
  HeartPulse, ChevronRight, Cpu, Activity, Star,
  TrendingUp, Play, UserPlus, ScanLine, Target, Clock,
  Sparkles, ShieldCheck, Gauge, Hash, AlertCircle,
  CheckCircle2, Shield, Scan, RotateCcw, Fingerprint,
  Upload, Camera, CameraOff,
} from "lucide-react";
import { api } from "../store/api";
import { Html5Qrcode } from "html5-qrcode";

/* ── Data ─────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Brain, color: "#f59e0b", glow: "rgba(245,158,11,0.3)",
    title: "AI Calorie Prediction",
    desc: "scikit-learn ML model predicts calories burned from your biometrics, heart rate, and session data in real-time.",
    tag: "Machine Learning",
  },
  {
    icon: QrCode, color: "#6366f1", glow: "rgba(99,102,241,0.3)",
    title: "QR Code Attendance",
    desc: "Instant check-in via unique QR codes. Scan, verify, and log attendance with automatic slot tracking.",
    tag: "Smart Access",
  },
  {
    icon: Calendar, color: "#10b981", glow: "rgba(16,185,129,0.3)",
    title: "Smart Slot Booking",
    desc: "Book your preferred workout timeslot. Automated capacity management prevents gym overcrowding.",
    tag: "Automation",
  },
  {
    icon: HeartPulse, color: "#f43f5e", glow: "rgba(244,63,94,0.3)",
    title: "Health & Goal Tracking",
    desc: "Set weight goals, track BMI, monitor calorie targets, and get personalized diet recommendations.",
    tag: "Wellness",
  },
  {
    icon: Trophy, color: "#38bdf8", glow: "rgba(56,189,248,0.3)",
    title: "Trainer Management",
    desc: "Dedicated trainer dashboards with trainee management, workout monitoring, and progress reports.",
    tag: "Performance",
  },
  {
    icon: BarChart3, color: "#a855f7", glow: "rgba(168,85,247,0.3)",
    title: "Analytics & Reports",
    desc: "Daily, weekly, and monthly reports with chart visualizations and downloadable PDF exports.",
    tag: "Insights",
  },
];

const PLANS = [
  {
    name: "Standard", key: "standard_monthly", price: "₹999", period: "/month",
    highlight: false, badge: null,
    features: ["QR Code Access", "Slot Booking", "Workout Logging", "BMI Tracker", "Basic Reports"],
    color: "#6b7280",
  },
  {
    name: "Elite", key: "elite_quarterly", price: "₹2,499", period: "/quarter",
    highlight: true, badge: "Most Popular",
    features: ["All Standard", "Trainer Assignment", "AI Calorie Predictor", "Diet Recommendations", "Goal Tracking", "Detailed Analytics"],
    color: "#f59e0b",
  },
  {
    name: "Premium", key: "premium_annual", price: "₹7,999", period: "/year",
    highlight: false, badge: "Best Value",
    features: ["All Elite", "Priority Trainer", "Advanced ML Insights", "PDF Reports", "VIP Slot Access", "Nutrition Plans"],
    color: "#6366f1",
  },
];

const STATS = [
  { val: "500+", label: "Active Members", icon: Users },
  { val: "15+", label: "Expert Trainers", icon: Trophy },
  { val: "98%", label: "Satisfaction", icon: Star },
  { val: "2M+", label: "Calories Tracked", icon: Activity },
];

const ROLES = [
  {
    role: "Member", icon: Dumbbell, color: "#f59e0b", glow: "rgba(245,158,11,0.25)",
    tagline: "Your fitness journey, powered by AI",
    items: ["QR Code Check-in", "Slot Booking", "Workout Logging", "AI Calorie Prediction", "Goal & BMI Tracking", "Diet Recommendations", "Progress Reports", "Razorpay Payments"],
  },
  {
    role: "Trainer", icon: Trophy, color: "#6366f1", glow: "rgba(99,102,241,0.25)",
    tagline: "Manage, monitor, and motivate your team",
    items: ["View Assigned Members", "Mark Attendance", "Monitor Workouts", "Send Training Advice", "View Progress Reports", "Slot Scheduling", "Performance Metrics", "Member Analytics"],
  },
];

const HOW_IT_WORKS = [
  { step: "01", icon: UserPlus, title: "Create Account", desc: "Register with your details and choose a membership plan. Pay securely via Razorpay.", color: "#f59e0b" },
  { step: "02", icon: ScanLine, title: "Get Your QR Code", desc: "Receive a unique QR code for instant gym check-in and attendance tracking.", color: "#6366f1" },
  { step: "03", icon: Calendar, title: "Book Slots", desc: "Reserve your preferred workout time slots. No more waiting or overcrowding.", color: "#10b981" },
  { step: "04", icon: Target, title: "Train & Track", desc: "Log workouts, track calories with AI prediction, and crush your fitness goals.", color: "#f43f5e" },
];

const WHY_US = [
  { icon: Brain, color: "#f59e0b", glow: "rgba(245,158,11,0.3)", title: "ML-Powered Intelligence", desc: "Our scikit-learn model doesn't guess — it predicts calories burned with real biometric data, giving you insights no fitness app can match." },
  { icon: ShieldCheck, color: "#10b981", glow: "rgba(16,185,129,0.3)", title: "Secure & Verified", desc: "Razorpay-powered payments, QR-authenticated attendance, and role-based access ensure complete security at every step." },
  { icon: Gauge, color: "#6366f1", glow: "rgba(99,102,241,0.3)", title: "Real-Time Performance", desc: "Live dashboards, instant slot updates, and real-time progress tracking keep you and your trainers always in sync." },
  { icon: Sparkles, color: "#f43f5e", glow: "rgba(244,63,94,0.3)", title: "Personalized Experience", desc: "AI diet recommendations, custom goal tracking, and tailored workout plans adapt to your unique fitness journey." },
];

/* ── Animated grid background ─────────────────────────────────────────── */
function GridBackground() {
  return (
    <div className="landing-grid-bg" aria-hidden="true">
      <div className="grid-lines" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="scanline" />
    </div>
  );
}

/* ── Floating particles ───────────────────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    dur: Math.random() * 8 + 6,
    delay: Math.random() * 5,
  }));
  return (
    <div className="particles-container" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="particle"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── Counter animation ───────────────────────────────────────────────── */
function AnimatedCounter({ target }: { target: string }) {
  const [display, setDisplay] = useState("0");
  const num = parseInt(target.replace(/[^0-9]/g, ""));
  const suffix = target.replace(/[0-9]/g, "");

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(num / 60);
    const timer = setInterval(() => {
      start = Math.min(start + step, num);
      setDisplay(start + suffix);
      if (start >= num) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [num, suffix]);

  return <span>{display}</span>;
}

/* ── Typed text effect ───────────────────────────────────────────────── */
function TypedText({ phrases }: { phrases: string[] }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = phrases[idx];
    if (!deleting && text.length < full.length) {
      const t = setTimeout(() => setText(full.slice(0, text.length + 1)), 60);
      return () => clearTimeout(t);
    } else if (!deleting && text.length === full.length) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    } else if (deleting && text.length > 0) {
      const t = setTimeout(() => setText(text.slice(0, -1)), 35);
      return () => clearTimeout(t);
    } else if (deleting && text.length === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % phrases.length);
    }
  }, [text, deleting, idx, phrases]);

  return (
    <span className="typed-text">
      {text}
      <span className="typed-cursor">|</span>
    </span>
  );
}

/* ── QR Attendance Scanner Component ─────────────────────────────────── */
function QRAttendanceScanner() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  // Clean up scanner on unmount or when closed
  useEffect(() => {
    if (!isTerminalOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isTerminalOpen]);

  const parseScannedText = (text: string): number | null => {
    if (text.startsWith("SMARTGYM|")) {
      const parts = text.split("|");
      const id = parseInt(parts[1]);
      if (!isNaN(id)) return id;
    }
    const parsed = parseInt(text.trim());
    if (!isNaN(parsed)) return parsed;
    return null;
  };

  const executeCheckin = async (userId: number) => {
    setLoading(true);
    setResult(null);
    setErrorMsg(null);
    try {
      const data = await api.attendance.qrCheckin(userId);
      setResult({
        success: true,
        member_name: data.member_name,
        status: data.status,
        time: data.time,
        slot: data.slot || "No slot assigned",
        id: userId
      });
      // Stop camera on success
      stopCamera();
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to mark attendance.");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setResult(null);
    setErrorMsg(null);
    try {
      setCameraActive(true);
      // Wait for DOM to render the container
      setTimeout(async () => {
        try {
          const scanner = new Html5Qrcode("landing-qr-reader");
          qrScannerRef.current = scanner;
          await scanner.start(
            { facingMode: "user" },
            {
              fps: 10,
              qrbox: { width: 160, height: 160 }
            },
            async (decodedText) => {
              const id = parseScannedText(decodedText);
              if (id) {
                await executeCheckin(id);
              } else {
                setErrorMsg("Invalid QR Code content.");
              }
            },
            () => { } // silent ignore parse failures
          );
        } catch (e: any) {
          setErrorMsg("Could not access camera. Please allow permission or try File Upload.");
          setCameraActive(false);
        }
      }, 300);
    } catch (e: any) {
      setErrorMsg("Camera initialization failed.");
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop();
      } catch (e) { }
    }
    qrScannerRef.current = null;
    setCameraActive(false);
  };

  return (
    <section className="qr-scanner-section">
      <div
        className="section-header-compact cursor-pointer group"
        onClick={() => setIsTerminalOpen(!isTerminalOpen)}
      >
        <div className="section-label group-hover:text-amber-400 transition-colors">
          <QrCode className="label-icon" /> Self-Service Attendance Punch
        </div>
        <h2 className="section-h2-compact flex items-center justify-center gap-3">
          QR <span className="h2-accent">PUNCH</span> TERMINAL
          <motion.div animate={{ rotate: isTerminalOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronRight className="w-6 h-6 text-amber-500" />
          </motion.div>
        </h2>
      </div>

      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            className="qr-terminal-widget mt-6"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div className="terminal-body">
              <div className="webcam-pane">
                {!cameraActive && !result && (
                  <div className="webcam-placeholder" onClick={startCamera}>
                    <div className="pulse-camera-icon">
                      <Camera className="w-8 h-8 text-amber-400" />
                    </div>
                    <span className="text-sm font-bold text-amber-400">START CAMERA SCAN</span>
                    <span className="text-xs text-muted-foreground text-center px-4">Hold your mobile screen QR code up to the webcam</span>
                  </div>
                )}

                {cameraActive && !result && (
                  <div className="camera-viewport-wrap">
                    <div id="landing-qr-reader" className="camera-view" />
                    <div className="camera-overlay-grid">
                      <div className="scanner-laser" />
                    </div>
                    <button onClick={stopCamera} className="stop-camera-btn">
                      <CameraOff className="w-4 h-4" /> STOP CAMERA
                    </button>
                  </div>
                )}
              </div>

              {/* Loader */}
              {loading && (
                <div className="terminal-overlay-loader">
                  <div className="spinner" />
                  <div className="text-xs font-bold text-amber-400 mt-2 uppercase tracking-widest">Marking Presence...</div>
                </div>
              )}

              {/* Success Result */}
              {result && result.success && (
                <motion.div
                  className="terminal-success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="success-icon-wrap-compact">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="success-name-compact">{result.member_name}</div>
                  <div className="success-tagline-compact">ATTENDANCE MARKED</div>

                  <div className="success-info-grid">
                    <div className="info-cell">
                      <div className="info-lbl">ID</div>
                      <div className="info-val">#{result.id}</div>
                    </div>
                    <div className="info-cell">
                      <div className="info-lbl">Time</div>
                      <div className="info-val">{result.time}</div>
                    </div>
                    <div className="info-cell">
                      <div className="info-lbl">Status</div>
                      <div className={`info-val status-pill ${result.status}`}>{result.status}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setResult(null); startCamera(); }}
                    className="btn-reset-terminal"
                  >
                    Scan Next Member
                  </button>
                </motion.div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <motion.div
                  className="terminal-error-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
                  <div className="error-title-compact">PUNCH FAILED</div>
                  <p className="error-desc-compact">{errorMsg}</p>
                  <button
                    onClick={() => { setErrorMsg(null); startCamera(); }}
                    className="btn-reset-terminal-err"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Main Component ───────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing-root">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <header className="landing-nav">
        <div className="nav-inner">
          {/* Logo */}
          <div className="nav-logo">
            <div className="logo-icon">
              <Flame className="logo-flame" />
            </div>
            <span className="logo-text">SMART<span className="logo-accent">GYM</span></span>
          </div>

          {/* Desktop links */}
          <nav className="nav-links">
            {["Features", "Plans", "About"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="nav-actions">
            <button onClick={() => navigate("/login")} className="nav-btn-ghost">Sign In</button>
            <button onClick={() => navigate("/login")} className="nav-btn-primary">
              Get Started <ArrowRight className="btn-icon" />
            </button>
            {/* Mobile hamburger */}
            <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <span className={`ham-line ${menuOpen ? "ham-open-1" : ""}`} />
              <span className={`ham-line ${menuOpen ? "ham-open-2" : ""}`} />
              <span className={`ham-line ${menuOpen ? "ham-open-3" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {["Features", "Plans", "About"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="mobile-link"
                  onClick={() => setMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <button onClick={() => navigate("/login")} className="nav-btn-primary mobile-cta">
                Get Started <ArrowRight className="btn-icon" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="hero-section" ref={heroRef}>
        <GridBackground />
        <Particles />

        <motion.div className="hero-content" style={{ y: heroY, opacity: heroOpacity }}>
          {/* Badge */}
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Cpu className="badge-icon" />
            <span>AI-Powered Gym Management</span>
            <div className="badge-dot" />
            {/* <span className="badge-live">v2.0</span> */}
          </motion.div>

          {/* Headline */}
          <motion.div
            className="hero-headline-wrap"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <h1 className="hero-h1">
              TRAIN
              <span className="hero-accent"> SMARTER</span>
              <br />
              <TypedText phrases={["TRACK BETTER", "PERFORM FASTER", "ACHIEVE MORE"]} />
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            The complete gym management platform with ML-powered calorie prediction,
            smart slot booking, QR attendance, and real-time analytics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <button onClick={() => navigate("/login")} className="hero-btn-primary">
              <Flame className="btn-icon" />
              Start Your Journey
              <ArrowRight className="btn-icon" />
            </button>

          </motion.div>


        </motion.div>

        {/* Scroll hint */}
        <div className="scroll-hint">
          <span className="scroll-text">Scroll</span>
          <motion.div
            className="scroll-bar"
            animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="features-section">
        {/* Section header */}
        <div className="section-header">
          <motion.div
            className="section-label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Zap className="label-icon" /> Platform Features
          </motion.div>
          <motion.h2
            className="section-h2"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            EVERYTHING <span className="h2-accent">YOU NEED</span>
          </motion.h2>
          <motion.p
            className="section-desc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            One platform for members, trainers, and admins — built for real gyms.
          </motion.p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              style={{ "--feature-glow": f.glow, "--feature-color": f.color } as React.CSSProperties}
            >
              <div className="feature-tag">{f.tag}</div>
              <div className="feature-icon-wrap" style={{ color: f.color }}>
                <f.icon className="feature-icon" />
                <div className="feature-icon-glow" />
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
              <div className="feature-line" style={{ background: f.color }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────────────── */}
      <section id="plans" className="plans-section">
        <div className="plans-bg" aria-hidden="true">
          <div className="plans-orb" />
        </div>

        <div className="section-header">
          <motion.div className="section-label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <TrendingUp className="label-icon" /> Membership Plans
          </motion.div>
          <motion.h2 className="section-h2" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            CHOOSE YOUR <span className="h2-accent">PLAN</span>
          </motion.h2>
        </div>

        <div className="plans-grid">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              className={`plan-card ${plan.highlight ? "plan-highlight" : ""}`}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              style={{ "--plan-color": plan.color } as React.CSSProperties}
            >
              {plan.badge && (
                <div className="plan-badge" style={{ color: plan.color, borderColor: plan.color }}>
                  {plan.badge}
                </div>
              )}

              <div className="plan-header">
                <div className="plan-color-bar" style={{ background: plan.color }} />
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price-row">
                  <span className="plan-price" style={{ color: plan.color }}>{plan.price}</span>
                  <span className="plan-period">{plan.period}</span>
                </div>
              </div>

              <ul className="plan-features">
                {plan.features.map((feat) => (
                  <li key={feat} className="plan-feature-item">
                    <CheckCircle className="feat-check" style={{ color: plan.color }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/login")}
                className={`plan-cta ${plan.highlight ? "plan-cta-primary" : "plan-cta-secondary"}`}
                style={plan.highlight ? { background: plan.color } : { borderColor: plan.color, color: plan.color }}
              >
                Get Started <ChevronRight className="btn-icon" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section id="about" className="hiw-section">
        <div className="section-header">
          <motion.div className="section-label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Clock className="label-icon" /> How It Works
          </motion.div>
          <motion.h2 className="section-h2" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            GET STARTED IN <span className="h2-accent">4 STEPS</span>
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            From sign-up to smashing your goals — it only takes minutes.
          </motion.p>
        </div>

        <div className="hiw-grid">
          {HOW_IT_WORKS.map((s, i) => (
            <motion.div
              key={s.step}
              className="hiw-card"
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{ "--hiw-color": s.color } as React.CSSProperties}
            >
              <div className="hiw-step" style={{ color: s.color }}>{s.step}</div>
              <div className="hiw-icon-wrap" style={{ color: s.color }}>
                <s.icon className="hiw-icon" />
              </div>
              <h3 className="hiw-title">{s.title}</h3>
              <p className="hiw-desc">{s.desc}</p>
              {i < HOW_IT_WORKS.length - 1 && <div className="hiw-connector" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Role Portals (Member & Trainer only) ─────────────────────── */}
      <section className="roles-section">
        <div className="section-header">
          <motion.div className="section-label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Dumbbell className="label-icon" /> Who It's For
          </motion.div>
          <motion.h2 className="section-h2" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            BUILT FOR <span className="h2-accent">EVERYONE</span>
          </motion.h2>
        </div>

        <div className="roles-grid roles-grid-2">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.role}
              className="role-card"
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              style={{ "--role-color": r.color, "--role-glow": r.glow } as React.CSSProperties}
            >
              <div className="role-icon-wrap" style={{ color: r.color, boxShadow: `0 0 24px ${r.glow}` }}>
                <r.icon className="role-icon" />
              </div>
              <h3 className="role-name" style={{ color: r.color }}>{r.role}</h3>
              <p className="role-tagline">{r.tagline}</p>
              <ul className="role-items">
                {r.items.map((item) => (
                  <li key={item} className="role-item">
                    <div className="role-dot" style={{ background: r.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Why SmartGym ──────────────────────────────────────────────── */}
      <section className="whyus-section">
        <div className="section-header">
          <motion.div className="section-label" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Sparkles className="label-icon" /> Why SmartGym
          </motion.div>
          <motion.h2 className="section-h2" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            NOT JUST A GYM, <span className="h2-accent">A SYSTEM</span>
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            Here's what makes SmartGym different from every other fitness platform.
          </motion.p>
        </div>

        <div className="whyus-grid">
          {WHY_US.map((w, i) => (
            <motion.div
              key={i}
              className="whyus-card"
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{ "--wu-color": w.color, "--wu-glow": w.glow } as React.CSSProperties}
            >
              <div className="whyus-icon-wrap" style={{ color: w.color }}>
                <w.icon className="whyus-icon" />
                <div className="whyus-icon-glow" />
              </div>
              <h3 className="whyus-title">{w.title}</h3>
              <p className="whyus-desc">{w.desc}</p>
              <div className="whyus-line" style={{ background: w.color }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-bg" aria-hidden="true">
          <div className="cta-ring cta-ring-1" />
          <div className="cta-ring cta-ring-2" />
          <div className="cta-orb" />
        </div>
        <motion.div
          className="cta-content"
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="cta-label">
            <Flame className="cta-label-icon" /> Ready to transform?
          </div>
          <h2 className="cta-h2">
            JOIN SMART<span className="hero-accent">GYM</span>
          </h2>
          <p className="cta-desc">
            Register today and get access to AI-powered fitness tracking,
            smart scheduling, and expert trainer guidance.
          </p>
          <button onClick={() => navigate("/login")} className="cta-btn">
            <Flame className="btn-icon" />
            Create Your Account
            <ArrowRight className="btn-icon" />
          </button>
        </motion.div>
      </section>

      {/* ── QR Attendance Scanner ─────────────────────────────────────── */}
      <QRAttendanceScanner />

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo-icon logo-icon-sm">
              <Flame className="logo-flame" />
            </div>
            <span className="logo-text">SMART<span className="logo-accent">GYM</span></span>
          </div>
          <p className="footer-copy">Smart Gym Management & Calorie Prediction System — Powered by ML</p>
          <div className="footer-right">
            <Users className="footer-icon" />
            <span>Multi-role platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
