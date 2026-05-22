import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BarChart3, TrendingUp, Users, CheckCircle2,
  Brain, Calendar, Download, Flame,
} from "lucide-react";
import { api } from "../../store/api";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const DISPLAY = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };
const COLORS = ["#f59e0b","#6366f1","#10b981","#ec4899","#38bdf8","#f97316"];

const CustomTooltip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs">
      {label && <div className="text-muted-foreground mb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</div>
      ))}
    </div>
  ) : null;

export default function Reports() {
  const [stats, setStats]           = useState<any>(null);
  const [checkins, setCheckins]     = useState<any[]>([]);
  const [calTrend, setCalTrend]     = useState<any[]>([]);
  const [slotOcc, setSlotOcc]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [period, setPeriod]         = useState<"weekly" | "monthly">("weekly");

  useEffect(() => {
    (async () => {
      const [s, ci, ct, so] = await Promise.all([
        api.reports.dashboard().catch(() => null),
        api.reports.weeklyCheckins().catch(() => []),
        api.reports.calorieTrends().catch(() => []),
        api.reports.slotOccupancy().catch(() => []),
      ]);
      setStats(s);
      const ciRaw = Array.isArray(ci) ? ci : ci?.results ?? [];
      setCheckins(ciRaw.map((d: any) => ({ date: d.date?.slice(5) ?? "", count: d.count })));
      const ctRaw = Array.isArray(ct) ? ct : ct?.results ?? [];
      setCalTrend(ctRaw.map((d: any) => ({ date: d.date?.slice(5) ?? "", cal: Math.round(d.predicted_calories ?? 0) })));
      const soRaw = Array.isArray(so) ? so : so?.results ?? [];
      setSlotOcc(soRaw.map((s: any) => ({ name: s.label, value: s.occupancy ?? 0, max: s.max_capacity ?? 5 })));
    })().finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Members", stats?.total_members ?? 0],
      ["Active Members", stats?.active_members ?? 0],
      ["Total Trainers", stats?.total_trainers ?? 0],
      ["Today's Check-ins", stats?.checkins_today ?? 0],
      ["Total Workouts", stats?.workouts_total ?? 0],
      ["Avg Calories/Session", Math.round(stats?.avg_calories ?? 0)],
      ["ML Predictions", stats?.ml_predictions ?? 0],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `smartgym-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  const kpi = [
    { label: "Total Members",   val: stats?.total_members ?? 0,                    icon: Users,        color: "text-amber-400",  bg: "bg-amber-400/10"   },
    { label: "Active",          val: stats?.active_members ?? 0,                   icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Avg Calories",    val: `${Math.round(stats?.avg_calories ?? 0)} kcal`, icon: Flame,        color: "text-rose-400",    bg: "bg-rose-400/10"    },
    { label: "ML Predictions",  val: stats?.ml_predictions ?? 0,                   icon: Brain,        color: "text-indigo-400",  bg: "bg-indigo-400/10"  },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="page-header-label mb-1">Analytics</div>
          <h1 className="text-4xl font-black" style={DISPLAY}>REPORTS & ANALYTICS</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time gym performance metrics and visualizations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-muted rounded-lg border border-border">
            {(["weekly","monthly"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${period === p ? "bg-amber-500 text-black" : "text-muted-foreground hover:text-foreground"}`}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={handleExportCSV} className="btn-secondary text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map((k, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.bg} ${k.color}`}><k.icon className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-black" style={DISPLAY}>{k.val}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Check-in trend */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            <h3 className="section-title">Daily Check-ins (7 days)</h3>
          </div>
          {checkins.length < 2 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Not enough data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={checkins} barSize={28}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Check-ins" radius={[6,6,0,0]}>
                  {checkins.map((_: any, i: number) => (
                    <Cell key={i} fill={i === checkins.length - 1 ? "#f59e0b" : "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Calorie trend */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="section-title">Calorie Prediction Trend</h3>
          </div>
          {calTrend.length < 2 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Not enough prediction data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={calTrend}>
                <defs>
                  <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cal" name="Calories (kcal)" stroke="#f59e0b" strokeWidth={2} fill="url(#rGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Slot occupancy pie + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="section-title">Slot Usage</h3>
          </div>
          {slotOcc.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No slot data.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={slotOcc} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} strokeWidth={0}>
                    {slotOcc.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0b0d17", border: "1px solid rgba(238,242,255,0.08)", borderRadius: 10, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {slotOcc.map((s: any, i: number) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                    <span className="font-bold">{s.value}/{s.max}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Summary table */}
        <div className="card-base p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="section-title">Summary Report</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Metric</th><th className="text-right">Value</th><th className="text-right">Status</th></tr></thead>
            <tbody>
              {[
                { metric: "Total Members",       val: stats?.total_members ?? 0,                       status: "info"    },
                { metric: "Active Members",       val: stats?.active_members ?? 0,                     status: "ok"      },
                { metric: "Pending Approval",     val: stats?.pending_approval ?? 0,                   status: stats?.pending_approval > 0 ? "warn" : "ok" },
                { metric: "Total Trainers",       val: stats?.total_trainers ?? 0,                     status: "info"    },
                { metric: "Today's Check-ins",    val: stats?.checkins_today ?? 0,                     status: "ok"      },
                { metric: "Total Workouts",       val: stats?.workouts_total ?? 0,                     status: "ok"      },
                { metric: "Avg Calories/Session", val: `${Math.round(stats?.avg_calories ?? 0)} kcal`, status: "ok"      },
                { metric: "ML Predictions Run",   val: stats?.ml_predictions ?? 0,                    status: "info"    },
              ].map((row, i) => (
                <tr key={i}>
                  <td>{row.metric}</td>
                  <td className="text-right font-bold">{row.val}</td>
                  <td className="text-right">
                    <span className={`badge ${row.status === "ok" ? "badge-green" : row.status === "warn" ? "badge-amber" : "badge-sky"}`}>
                      {row.status === "ok" ? "Good" : row.status === "warn" ? "Action needed" : "Info"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <button onClick={handleExportCSV} className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Download CSV Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
