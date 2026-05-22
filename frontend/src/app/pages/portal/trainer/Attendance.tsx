import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserCheck, CheckCircle2, AlertCircle, Clock, Calendar } from "lucide-react";
import { api } from "../../../store/api";

const D = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };

export default function TrainerAttendance() {
  const [trainees, setTrainees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [marking, setMarking] = useState<Record<number, boolean>>({});
  const [markedStatus, setMarkedStatus] = useState<Record<number, string>>({});

  const flash = (type: "ok" | "err", text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  useEffect(() => {
    Promise.all([
      api.trainers.getTrainees().catch(() => []),
      api.attendance.list().catch(() => []),
    ]).then(([t, a]) => {
      setTrainees(Array.isArray(t) ? t : t?.results ?? []);
      const attRaw = Array.isArray(a) ? a : a?.results ?? [];
      setAttendance(attRaw);
      // Pre-fill today's existing marks
      const today = new Date().toISOString().split("T")[0];
      const todayMap: Record<number, string> = {};
      attRaw.filter((r: any) => r.date === today).forEach((r: any) => {
        todayMap[r.member_id ?? r.member] = r.status;
      });
      setMarkedStatus(todayMap);
    }).finally(() => setLoading(false));
  }, []);

  const handleMark = async (memberId: number, status: string) => {
    setMarking(prev => ({ ...prev, [memberId]: true }));
    try {
      await api.attendance.manualMark(memberId, status);
      setMarkedStatus(prev => ({ ...prev, [memberId]: status }));
      flash("ok", `Marked ${status} for member #${memberId}`);
    } catch (e: any) { flash("err", e.message); }
    finally { setMarking(prev => ({ ...prev, [memberId]: false })); }
  };

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const todayAtt = attendance.filter((a: any) => a.date === new Date().toISOString().split("T")[0]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="page-header-label mb-1">Trainer · Attendance</div>
        <h1 className="text-4xl font-black" style={D}>MARK ATTENDANCE</h1>
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm ${msg.type === "ok" ? "bg-emerald-500/8 border-emerald-500/25 text-emerald-400" : "bg-destructive/8 border-destructive/25 text-destructive"}`}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {msg.type === "ok" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Present", val: Object.values(markedStatus).filter(s => s === "present").length, c: "bg-emerald-400/10 text-emerald-400" },
          { label: "Late", val: Object.values(markedStatus).filter(s => s === "late").length, c: "bg-amber-400/10 text-amber-400" },
          { label: "Absent", val: Object.values(markedStatus).filter(s => s === "absent").length, c: "bg-rose-400/10 text-rose-400" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{s.label}</div>
            <div className={`text-4xl font-black ${s.c.split(" ")[1]}`} style={D}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Mark attendance */}
      <div className="card-base overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="section-title flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" /> Today's Attendance
          </h3>
          <span className="badge badge-sky">{trainees.length} trainees</span>
        </div>

        {trainees.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No trainees assigned. Ask admin to assign members.</div>
        ) : (
          <div className="divide-y divide-border">
            {trainees.map((t: any) => {
              const status = markedStatus[t.id];
              const isMarking = marking[t.id];
              return (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-amber text-black font-black flex items-center justify-center text-base shrink-0" style={D}>
                      {(t.full_name || t.user_name || "M")[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.full_name || t.user_name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {t.slot_label || "No slot"} · {t.weight_kg}kg · BMI {t.bmi}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {status && (
                      <span className={`badge ${status === "present" ? "badge-green" : status === "late" ? "badge-amber" : "badge-red"}`}>
                        ✓ {status}
                      </span>
                    )}
                    {(["present", "late", "absent"] as const).map(s => (
                      <button key={s}
                        disabled={isMarking}
                        onClick={() => handleMark(t.id, s)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          status === s ? (
                            s === "present" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
                            s === "late"    ? "bg-amber-500/20 border-amber-500/50 text-amber-400" :
                                             "bg-rose-500/20 border-rose-500/50 text-rose-400"
                          ) : (
                            s === "present" ? "border-emerald-500/20 text-emerald-400/60 hover:bg-emerald-500/10 hover:border-emerald-500/40" :
                            s === "late"    ? "border-amber-500/20 text-amber-400/60 hover:bg-amber-500/10 hover:border-amber-500/40" :
                                             "border-rose-500/20 text-rose-400/60 hover:bg-rose-500/10 hover:border-rose-500/40"
                          )
                        }`}>
                        {isMarking ? "…" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent history */}
      {attendance.length > 0 && (
        <div className="card-base overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="section-title">Recent Attendance Log</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Member</th><th>Date</th><th>Time</th><th>Slot</th><th className="text-right">Status</th></tr></thead>
            <tbody>
              {attendance.slice(0, 15).map((a: any) => (
                <tr key={a.id}>
                  <td className="font-semibold">{a.member_name}</td>
                  <td className="text-muted-foreground">{a.date}</td>
                  <td className="text-muted-foreground">{a.time || a.check_in_time || "—"}</td>
                  <td className="text-muted-foreground text-xs">{a.slot_label || "—"}</td>
                  <td className="text-right"><span className={`badge ${a.status === "present" ? "badge-green" : a.status === "late" ? "badge-amber" : "badge-red"}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
