import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, CheckCircle2, Clock, UserCheck, AlertCircle,
  Pencil, X, Shield, Calendar, Dumbbell, Trash2,
} from "lucide-react";
import { api } from "../../../store/api";

const D = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };

export default function AdminMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "active">("all");

  // Edit form state
  const [editMember, setEditMember] = useState<any | null>(null);
  const [editTrainer, setEditTrainer] = useState<string>("");
  const [editSlot, setEditSlot] = useState<string>("");
  const [editPayment, setEditPayment] = useState<string>("paid");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAge, setEditAge] = useState(25);
  const [editHeight, setEditHeight] = useState(170);
  const [editWeight, setEditWeight] = useState(70);
  const [editTargetWeight, setEditTargetWeight] = useState(65);
  const [editCalorieTarget, setEditCalorieTarget] = useState(2200);
  const [editPlan, setEditPlan] = useState("standard_monthly");
  const [editStatus, setEditStatus] = useState("inactive");
  const [saving, setSaving] = useState(false);

  const flash = (type: "ok" | "err", text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = async () => {
    const [m, tr, sl] = await Promise.all([
      api.members.list().catch(() => []),
      api.trainers.list().catch(() => []),
      api.slots.list().catch(() => []),
    ]);
    setMembers(Array.isArray(m) ? m : m?.results ?? []);
    setTrainers(Array.isArray(tr) ? tr : tr?.results ?? []);
    setSlots(Array.isArray(sl) ? sl : sl?.results ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try { await api.members.approve(id); await load(); flash("ok", "Member approved & QR generated!"); }
    catch (e: any) { flash("err", e.message); }
    finally { setApprovingId(null); }
  };

  const openEdit = (m: any) => {
    setEditMember(m);
    setEditTrainer(m.assigned_trainer?.id ?? m.assigned_trainer ?? "");
    setEditSlot(m.selected_slot?.id ?? m.selected_slot ?? "");
    setEditPayment(m.payment_status ?? "paid");
    setEditFirstName(m.user?.first_name ?? "");
    setEditLastName(m.user?.last_name ?? "");
    setEditEmail(m.user?.email ?? "");
    setEditPhone(m.user?.phone ?? "");
    setEditAge(m.age ?? 25);
    setEditHeight(m.height_cm ?? 170);
    setEditWeight(m.weight_kg ?? 70);
    setEditTargetWeight(m.target_weight_kg ?? 65);
    setEditCalorieTarget(m.calorie_target ?? 2200);
    setEditPlan(m.membership_plan ?? "standard_monthly");
    setEditStatus(m.status ?? "inactive");
  };

  const handleSaveEdit = async () => {
    if (!editMember) return;
    setSaving(true);
    try {
      const payload: any = {
        payment_status: editPayment,
        membership_plan: editPlan,
        status: editStatus,
        age: editAge,
        height_cm: editHeight,
        weight_kg: editWeight,
        target_weight_kg: editTargetWeight,
        calorie_target: editCalorieTarget,
        user: {
          first_name: editFirstName,
          last_name: editLastName,
          email: editEmail,
          phone: editPhone,
        }
      };
      if (editTrainer) {
        payload.assigned_trainer = parseInt(editTrainer);
      } else {
        payload.assigned_trainer = null;
      }
      
      // Update Slot if changed
      if (editSlot) {
        await api.members.bookSlot(editMember.id, parseInt(editSlot));
      } else {
        payload.selected_slot = null;
      }

      await api.members.update(editMember.id, payload);
      await load();
      setEditMember(null);
      flash("ok", "Member updated successfully!");
    } catch (e: any) {
      flash("err", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this member? This will remove their profile and user account.")) return;
    setSaving(true);
    try {
      await api.members.delete(id);
      await load();
      setEditMember(null);
      flash("ok", "Member deleted successfully!");
    } catch (e: any) {
      flash("err", e.message);
    } finally {
      setSaving(false);
    }
  };

  const displayed = members.filter(m =>
    filter === "all" ? true : filter === "pending" ? !m.approved : m.status === "active"
  );

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="page-header-label mb-1">Admin · Members</div>
          <h1 className="text-4xl font-black" style={D}>MEMBER MANAGEMENT</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve registrations, assign trainers, manage memberships.</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { key: "all", label: `All (${members.length})` },
            { key: "pending", label: `Pending (${members.filter(m => !m.approved).length})` },
            { key: "active", label: `Active (${members.filter(m => m.status === "active").length})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                filter === f.key ? "bg-amber-500 text-black border-amber-500" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>{f.label}</button>
          ))}
        </div>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", val: members.length, icon: Users, c: "bg-amber-400/10 text-amber-400" },
          { label: "Active", val: members.filter(m => m.status === "active").length, icon: CheckCircle2, c: "bg-emerald-400/10 text-emerald-400" },
          { label: "Pending", val: members.filter(m => !m.approved).length, icon: Clock, c: "bg-rose-400/10 text-rose-400" },
          { label: "Paid", val: members.filter(m => m.payment_status === "paid").length, icon: Shield, c: "bg-indigo-400/10 text-indigo-400" },
        ].map((s, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.c}`}><s.icon className="w-4 h-4" /></div>
            </div>
            <div className="text-4xl font-black" style={D}>{s.val}</div>
          </motion.div>
        ))}
      </div>

      {/* Members table */}
      <div className="card-base overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="section-title flex items-center gap-2"><Users className="w-5 h-5 text-amber-400" /> Members</h3>
          <span className="badge badge-sky">{displayed.length} shown</span>
        </div>
        {displayed.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Member</th><th>Plan</th><th>Trainer</th><th>Slot</th><th>Payment</th><th>Status</th><th className="text-right">Action</th></tr></thead>
              <tbody>
                {displayed.map((m: any) => (
                  <tr key={m.id}>
                    <td>
                      <div className="font-semibold">{m.full_name || m.user?.first_name || m.username}</div>
                      <div className="text-xs text-muted-foreground">{m.email || m.user?.email} · BMI {m.bmi}</div>
                    </td>
                    <td><span className="badge badge-indigo text-[10px]">{m.membership_plan?.replace(/_/g, " ")}</span></td>
                    <td className="text-xs text-muted-foreground">{m.trainer_name || "—"}</td>
                    <td className="text-xs text-muted-foreground">{m.slot_time || "—"}</td>
                    <td><span className={`badge ${m.payment_status === "paid" ? "badge-green" : m.payment_status === "pending" ? "badge-amber" : "badge-red"}`}>{m.payment_status}</span></td>
                    <td><span className={`badge ${m.approved ? (m.status === "active" ? "badge-green" : "badge-amber") : "badge-red"}`}>{m.approved ? m.status : "pending"}</span></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!m.approved && (
                          <button onClick={() => handleApprove(m.id)} disabled={approvingId === m.id}
                            className="btn-primary py-1.5 px-3 text-xs">
                            {approvingId === m.id ? <span className="spinner w-3 h-3 border-2 border-black/30 border-t-black" /> : <><UserCheck className="w-3.5 h-3.5" /> Approve</>}
                          </button>
                        )}
                        <button onClick={() => openEdit(m)} className="btn-secondary py-1.5 px-3 text-xs">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDeleteMember(m.id)} className="btn-ghost py-1.5 px-2 text-destructive hover:bg-destructive/10 text-xs">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editMember && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditMember(null)} />
            <motion.div className="relative glass-strong rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title">Edit Member: {editMember.full_name || editMember.username}</h3>
                <button onClick={() => setEditMember(null)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                
                {/* Personal Information */}
                <div className="border-b border-border pb-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-3">Personal Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">First Name</label>
                      <input className="input-base" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Last Name</label>
                      <input className="input-base" value={editLastName} onChange={e => setEditLastName(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Email</label>
                      <input className="input-base" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Phone</label>
                      <input className="input-base" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Biometrics */}
                <div className="border-b border-border pb-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-3">Biometrics & Fitness Target</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Age</label>
                      <input className="input-base" type="number" value={editAge} onChange={e => setEditAge(parseInt(e.target.value) || 25)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Height (cm)</label>
                      <input className="input-base" type="number" value={editHeight} onChange={e => setEditHeight(parseFloat(e.target.value) || 170)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Weight (kg)</label>
                      <input className="input-base" type="number" value={editWeight} onChange={e => setEditWeight(parseFloat(e.target.value) || 70)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Target Weight (kg)</label>
                      <input className="input-base" type="number" value={editTargetWeight} onChange={e => setEditTargetWeight(parseFloat(e.target.value) || 65)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Calorie Target</label>
                      <input className="input-base" type="number" value={editCalorieTarget} onChange={e => setEditCalorieTarget(parseInt(e.target.value) || 2200)} />
                    </div>
                  </div>
                </div>

                {/* Gym Configuration */}
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-3">Gym Configurations</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Assign Trainer</label>
                      <select className="input-base" value={editTrainer} onChange={e => setEditTrainer(e.target.value)}>
                        <option value="">— No trainer —</option>
                        {trainers.map((t: any) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Assign Slot</label>
                      <select className="input-base" value={editSlot} onChange={e => setEditSlot(e.target.value)}>
                        <option value="">— No slot —</option>
                        {slots.map((s: any) => <option key={s.id} value={s.id}>{s.label} ({s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}) {s.occupancy}/{s.max_capacity}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Membership Plan</label>
                      <select className="input-base" value={editPlan} onChange={e => setEditPlan(e.target.value)}>
                        <option value="standard_monthly">Standard Monthly</option>
                        <option value="elite_quarterly">Elite Quarterly</option>
                        <option value="premium_annual">Premium Annual</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Payment Status</label>
                      <select className="input-base" value={editPayment} onChange={e => setEditPayment(e.target.value)}>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Status</label>
                      <select className="input-base" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                  <button onClick={() => handleDeleteMember(editMember.id)} className="btn-secondary text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40 sm:w-1/3 order-3 sm:order-1">
                    <Trash2 className="w-4 h-4 inline-block mr-1" /> Delete Member
                  </button>
                  <div className="flex-1" />
                  <div className="flex gap-2 sm:w-1/2 order-2">
                    <button onClick={() => setEditMember(null)} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={handleSaveEdit} disabled={saving} className="btn-primary flex-1">
                      {saving ? <span className="spinner w-4 h-4 border-2 border-black/30 border-t-black" /> : "Save Changes"}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
