import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Plus, X, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../../store/api";

const D = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };

export default function AdminSlots() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [start, setStart] = useState("06:00");
  const [end, setEnd] = useState("07:00");
  const [max, setMax] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const flash = (type: "ok" | "err", text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = async () => {
    const data = await api.slots.list().catch(() => []);
    setSlots(Array.isArray(data) ? data : data?.results ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleAdd = async () => {
    if (!label) { flash("err", "Slot label is required."); return; }
    setSubmitting(true);
    try {
      await fetch("http://localhost:8000/api/slots/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${api.getToken()}` },
        body: JSON.stringify({ label, start_time: start, end_time: end, max_capacity: max, active: true }),
      });
      await load();
      setShowForm(false);
      setLabel(""); setStart("06:00"); setEnd("07:00"); setMax(5);
      flash("ok", "Time slot created!");
    } catch (e: any) { flash("err", e.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  const total = slots.reduce((a, s) => a + (s.occupancy ?? 0), 0);
  const capacity = slots.reduce((a, s) => a + (s.max_capacity ?? 0), 0);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="page-header-label mb-1">Admin · Slots</div>
          <h1 className="text-4xl font-black" style={D}>TIME SLOT MANAGEMENT</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure gym workout timeslots and capacity limits.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Slot
        </button>
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Slots", val: slots.length, c: "bg-amber-400/10 text-amber-400" },
          { label: "Members Booked", val: total, c: "bg-indigo-400/10 text-indigo-400" },
          { label: "Total Capacity", val: capacity, c: "bg-emerald-400/10 text-emerald-400" },
        ].map((s, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{s.label}</div>
            <div className="text-4xl font-black" style={D}>{s.val}</div>
          </motion.div>
        ))}
      </div>

      {/* Slots grid */}
      {slots.length === 0 ? (
        <div className="card-base p-12 text-center text-muted-foreground text-sm">No slots configured. Add your first time slot.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((s: any, i) => {
            const count = s.occupancy ?? 0;
            const maxCap = s.max_capacity ?? 5;
            const pct = Math.min(100, (count / maxCap) * 100);
            const isFull = count >= maxCap;
            return (
              <motion.div key={s.id} className="card-base p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className={`badge ${isFull ? "badge-red" : pct >= 60 ? "badge-amber" : "badge-green"}`}>
                    {isFull ? "FULL" : `${count}/${maxCap}`}
                  </span>
                </div>
                <div className="font-bold text-base mb-1">{s.label}</div>
                <div className="text-xs text-muted-foreground mb-3">{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}</div>
                <div className="progress-track mb-1.5">
                  <div className={`progress-fill ${isFull ? "bg-rose-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{count} booked</span>
                  <span>{maxCap - count} spots left</span>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className={`badge ${s.active ? "badge-green" : "badge-red"}`}>{s.active ? "Active" : "Inactive"}</span>
                  <span className="text-xs text-muted-foreground">Capacity: {maxCap}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Slot Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div className="relative glass-strong rounded-2xl p-6 w-full max-w-md" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title flex items-center gap-2"><Calendar className="w-5 h-5 text-amber-400" /> New Time Slot</h3>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Label *</label>
                  <input className="input-base" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Morning Prime" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Start Time</label>
                    <input className="input-base" type="time" value={start} onChange={e => setStart(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">End Time</label>
                    <input className="input-base" type="time" value={end} onChange={e => setEnd(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Max Capacity</label>
                  <input className="input-base" type="number" value={max} onChange={e => setMax(+e.target.value)} min={1} max={50} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleAdd} disabled={submitting} className="btn-primary flex-1">
                    {submitting ? <span className="spinner w-4 h-4 border-2 border-black/30 border-t-black" /> : <><Plus className="w-4 h-4" /> Create Slot</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
