import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame, LayoutDashboard, Users, Trophy, Calendar,
  QrCode, Brain, BarChart3, LogOut, Menu, X,
  Bell, ChevronRight, Dumbbell, User, Utensils,
  ClipboardList, UserCheck,
} from "lucide-react";
import { api, UserSession } from "../store/api";

const DISPLAY = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };

const NAV_BY_ROLE = {
  admin: [
    { to: "/portal/overview",  label: "Dashboard",   icon: LayoutDashboard },
    { to: "/portal/members",   label: "Members",     icon: Users },
    { to: "/portal/trainers",  label: "Trainers",    icon: Trophy },
    { to: "/portal/slots",     label: "Time Slots",  icon: Calendar },
    { to: "/portal/scanner",   label: "QR Scanner",  icon: QrCode },
    { to: "/portal/reports",   label: "Reports",     icon: BarChart3 },
  ],
  trainer: [
    { to: "/portal/overview",    label: "Dashboard",       icon: LayoutDashboard },
    { to: "/portal/trainees",    label: "My Trainees",     icon: Users },
    { to: "/portal/attendance",  label: "Mark Attendance", icon: UserCheck },
    { to: "/portal/reports",     label: "Reports",         icon: BarChart3 },
  ],
  member: [
    { to: "/portal/overview",   label: "Dashboard",    icon: LayoutDashboard },
    { to: "/portal/profile",    label: "My Profile",   icon: User },
    { to: "/portal/workouts",   label: "Workouts",     icon: Dumbbell },
    { to: "/portal/predictor",  label: "Calorie AI",   icon: Brain },
    { to: "/portal/diet",       label: "Diet Plan",    icon: Utensils },
  ],
};

const ROLE_BADGE: Record<string, string> = {
  admin:   "badge-rose",
  trainer: "badge-indigo",
  member:  "badge-amber",
};

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession]       = useState<UserSession | null>(api.getSession());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const s = api.getSession();
    if (!s) { navigate("/login"); return; }
    setSession(s);
  }, [navigate]);

  useEffect(() => {
    const h = () => { api.clearSession(); navigate("/login"); };
    window.addEventListener("sg_unauthorized", h);
    return () => window.removeEventListener("sg_unauthorized", h);
  }, [navigate]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  if (!session) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const navItems = NAV_BY_ROLE[session.role] ?? NAV_BY_ROLE.member;
  const initials = session.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => { api.clearSession(); navigate("/login"); };

  const Sidebar = () => (
    <aside className="h-full flex flex-col bg-card border-r border-border" style={{ boxShadow: "4px 0 24px rgba(0,0,0,0.4)" }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 gradient-amber rounded-xl flex items-center justify-center shrink-0"
          style={{ boxShadow: "0 0 20px rgba(245,158,11,0.3)" }}>
          <Flame className="w-5 h-5 text-black" />
        </div>
        <div>
          <div className="text-xl font-black tracking-tight leading-none" style={DISPLAY}>
            SMART<span className="text-amber-400">GYM</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
            {session.role} Portal
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-4 pb-1">
        <div className="text-[9px] text-muted-foreground/60 uppercase tracking-widest font-bold">Navigation</div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-500 text-black shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`
            }>
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-black/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl gradient-amber text-black font-black text-sm flex items-center justify-center shrink-0"
            style={{ boxShadow: "0 0 16px rgba(245,158,11,0.2)" }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold truncate">{session.name}</div>
            <div className="text-xs text-muted-foreground truncate">{session.email}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`badge ${ROLE_BADGE[session.role] ?? "badge-amber"}`}>{session.role}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-rose-500/5">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex text-foreground overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 shrink-0 flex-col fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </div>

      {/* Mobile overlay + sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div key="overlay"
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} />
            <motion.div key="sidebar"
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}>
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center justify-between px-5 bg-background/90 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(o => !o)} className="md:hidden btn-ghost p-2">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" style={{ animation: "pulse 2s infinite" }} />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">System Online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-ghost p-2 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border">
              <div className="w-6 h-6 gradient-amber rounded-md flex items-center justify-center text-black text-[10px] font-black">
                {initials}
              </div>
              <span className="text-xs font-semibold">{session.name}</span>
              <span className={`badge ${ROLE_BADGE[session.role] ?? "badge-amber"} py-0.5`}>{session.role}</span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all cursor-pointer">
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
