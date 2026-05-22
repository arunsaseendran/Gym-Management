import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Users, Trophy, CheckCircle2, Brain, Clock, Flame,
  TrendingUp, Dumbbell, Activity, Calendar, UserCheck,
  AlertTriangle,
} from "lucide-react";
import { api } from "../../store/api";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const D = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };

function StatCard({ label, value, sub, icon: Icon, color, delay = 0 }: any) {
  return (
    <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
      </div>
      <div className="text-4xl font-black leading-none mb-1.5" style={D}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground font-medium">{sub}</div>}
    </motion.div>
  );
}

// ── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ stats, slots, attendance, calorieTrend }: any) {
  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Members"   value={stats?.total_members ?? 0}  sub={`${stats?.active_members ?? 0} active`}          icon={Users}        color="bg-amber-400/10 text-amber-400"   delay={0}    />
        <StatCard label="Active Trainers" value={stats?.total_trainers ?? 0} sub="On duty"                                          icon={Trophy}       color="bg-indigo-400/10 text-indigo-400" delay={0.07} />
        <StatCard label="Check-ins Today" value={stats?.checkins_today ?? 0} sub="QR scans logged"                                  icon={CheckCircle2} color="bg-emerald-400/10 text-emerald-400" delay={0.14}/>
        <StatCard label="ML Predictions"  value={stats?.ml_predictions ?? 0} sub={`Avg ${Math.round(stats?.avg_calories ?? 0)} kcal`} icon={Brain}      color="bg-purple-400/10 text-purple-400"  delay={0.21}/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Slot occupancy */}
        <div className="xl:col-span-2 card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="section-title">Timeslot Occupancy</h2>
          </div>
          {slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No time slots configured.</div>
          ) : (
            <div className="space-y-3">
              {slots.map((s: any) => {
                const count = s.occupancy ?? 0; const max = s.max_capacity ?? 5;
                const pct = Math.min(100, (count / max) * 100); const full = count >= max;
                return (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl bg-muted/50 border border-border">
                    <div className="sm:w-40 shrink-0">
                      <div className="font-semibold text-sm">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="progress-track">
                        <div className={`progress-fill ${full ? "bg-rose-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{count}/{max} members</span>
                        <span className={full ? "text-rose-400 font-bold" : "text-emerald-400"}>{full ? "FULL" : `${max-count} spots left`}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending approvals */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="section-title">Pending Approvals</h2>
          </div>
          <div className="text-5xl font-black text-amber-400 mb-1" style={D}>{stats?.pending_approval ?? 0}</div>
          <div className="text-xs text-muted-foreground mb-5">members awaiting approval</div>
          {stats?.pending_approval > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-400">
              Go to <strong>Members</strong> page to approve and assign trainers.
            </div>
          )}
        </div>
      </div>

      {/* Recent attendance */}
      <AttendanceTable attendance={attendance} />

      {calorieTrend.length > 1 && <CalorieChart data={calorieTrend} />}
    </>
  );
}

// ── TRAINER DASHBOARD ─────────────────────────────────────────────────────────
function TrainerDashboard({ stats, attendance }: any) {
  const today = attendance.filter((a: any) => a.date === new Date().toISOString().split("T")[0]);
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="My Trainees"      value={stats?.total_members ?? 0}  sub="Assigned to you"  icon={Users}       color="bg-amber-400/10 text-amber-400"    delay={0}    />
        <StatCard label="Today's Check-ins" value={today.length}               sub="Present today"    icon={UserCheck}   color="bg-emerald-400/10 text-emerald-400" delay={0.07} />
        <StatCard label="Workouts Logged"  value={stats?.workouts_total ?? 0} sub="Total sessions"   icon={Dumbbell}    color="bg-indigo-400/10 text-indigo-400"   delay={0.14} />
      </div>

      <div className="card-base p-5 border-amber-500/15 bg-amber-500/3">
        <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Quick Actions</div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>→ Go to <strong className="text-foreground">My Trainees</strong> to view assigned members and send advice</span>
          <span>→ Go to <strong className="text-foreground">Mark Attendance</strong> to record today's presence</span>
          <span>→ Go to <strong className="text-foreground">Reports</strong> to see workout analytics</span>
        </div>
      </div>

      <AttendanceTable attendance={attendance} />
    </>
  );
}

// ── MEMBER DASHBOARD ──────────────────────────────────────────────────────────
function MemberDashboard({ stats, attendance, calorieTrend }: any) {
  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Workouts"        value={stats?.workouts_total ?? 0}                          sub="Sessions logged"   icon={Dumbbell} color="bg-amber-400/10 text-amber-400"   delay={0}    />
        <StatCard label="Avg Calories"    value={`${Math.round(stats?.avg_calories ?? 0)}`}            sub="per session (ML)"  icon={Flame}    color="bg-rose-400/10 text-rose-400"     delay={0.07} />
        <StatCard label="ML Predictions" value={stats?.ml_predictions ?? 0}                           sub="Total predictions" icon={Brain}    color="bg-purple-400/10 text-purple-400" delay={0.14} />
        <StatCard label="Check-ins"       value={attendance.length}                                   sub="Total gym visits"  icon={CheckCircle2} color="bg-emerald-400/10 text-emerald-400" delay={0.21}/>
      </div>

      <div className="card-base p-5 border-amber-500/15 bg-amber-500/3">
        <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Quick Guide</div>
        <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <span>→ <strong className="text-foreground">My Profile</strong>: View QR code, book a timeslot, upload photo</span>
          <span>→ <strong className="text-foreground">Workouts</strong>: Log sessions, track calories, set BMI goals</span>
          <span>→ <strong className="text-foreground">Calorie AI</strong>: Run ML calorie predictions anytime</span>
          <span>→ <strong className="text-foreground">Diet Plan</strong>: Get personalised BMI-based meal plans</span>
        </div>
      </div>

      {calorieTrend.length > 1 && <CalorieChart data={calorieTrend} />}
      <AttendanceTable attendance={attendance} />
    </>
  );
}

// ── Shared components ──────────────────────────────────────────────────────────
function AttendanceTable({ attendance }: { attendance: any[] }) {
  if (attendance.length === 0) return null;
  return (
    <div className="card-base overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="section-title flex items-center gap-2"><Activity className="w-5 h-5 text-amber-400" /> Recent Attendance</h3>
        <span className="badge badge-sky">{attendance.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Member</th><th>Date</th><th>Time</th><th>Slot</th><th className="text-right">Status</th></tr></thead>
          <tbody>
            {attendance.slice(0, 8).map((a: any) => (
              <tr key={a.id}>
                <td className="font-semibold">{a.member_name}</td>
                <td className="text-muted-foreground">{a.date}</td>
                <td className="text-muted-foreground">{a.time || a.check_in_time || "—"}</td>
                <td className="text-muted-foreground text-xs">{a.slot_label || "—"}</td>
                <td className="text-right">
                  <span className={`badge ${a.status === "present" ? "badge-green" : a.status === "late" ? "badge-amber" : "badge-red"}`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalorieChart({ data }: { data: any[] }) {
  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-2 mb-5"><TrendingUp className="w-5 h-5 text-amber-400" /><h3 className="section-title">Calorie Prediction Trend</h3></div>
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={{ background: "#0b0d17", border: "1px solid rgba(238,242,255,0.08)", borderRadius: 10, fontSize: 12 }}
            formatter={(v: any) => [`${v} kcal`, "Calories"]} />
          <Area type="monotone" dataKey="cal" stroke="#f59e0b" strokeWidth={2} fill="url(#cg)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────
export default function Overview() {
  const session = api.getSession();
  const [stats, setStats] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [calorieTrend, setCalorieTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.reports.dashboard().catch(() => null),
      api.slots.list().catch(() => []),
      api.attendance.list().catch(() => []),
      api.reports.calorieTrends().catch(() => []),
    ]).then(([s, sl, att, ct]) => {
      setStats(s);
      setSlots(Array.isArray(sl) ? sl : sl?.results ?? []);
      setAttendance(Array.isArray(att) ? att : att?.results ?? []);
      const raw = Array.isArray(ct) ? ct : ct?.results ?? [];
      setCalorieTrend(raw.map((r: any) => ({ date: r.date?.slice(5) ?? "", cal: Math.round(r.predicted_calories ?? 0) })));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  const greeting = session?.role === "admin" ? "GYM OVERVIEW" : session?.role === "trainer" ? "TRAINER OVERVIEW" : "MY DASHBOARD";

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <div className="page-header-label mb-1">Dashboard</div>
        <h1 className="text-4xl md:text-5xl font-black" style={D}>{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {session?.role === "admin"   && <AdminDashboard stats={stats} slots={slots} attendance={attendance} calorieTrend={calorieTrend} />}
      {session?.role === "trainer" && <TrainerDashboard stats={stats} attendance={attendance} />}
      {session?.role === "member"  && <MemberDashboard stats={stats} attendance={attendance} calorieTrend={calorieTrend} />}
    </div>
  );
}
