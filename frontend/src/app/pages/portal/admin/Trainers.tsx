import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Plus, X, CheckCircle2, AlertCircle, UserPlus, Users, Pencil, Trash2 } from "lucide-react";
import { api } from "../../../store/api";

const D = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };
const SPECS = ["strength","yoga","cardio","crossfit","swimming","pilates","general"];

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  
  // Add trainer form state
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [spec, setSpec] = useState("general");
  const [schedule, setSchedule] = useState("6:00 AM – 2:00 PM");
  const [submitting, setSubmitting] = useState(false);

  // Edit trainer form state
  const [editTrainer, setEditTrainer] = useState<any | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSpec, setEditSpec] = useState("general");
  const [editSchedule, setEditSchedule] = useState("6:00 AM – 2:00 PM");
  const [editAvailability, setEditAvailability] = useState(true);
  const [editBio, setEditBio] = useState("");

  const flash = (type: "ok" | "err", text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = async () => {
    const data = await api.trainers.list().catch(() => []);
    setTrainers(Array.isArray(data) ? data : data?.results ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleAdd = async () => {
    if (!username || !password || !firstName) { flash("err", "Username, password, and first name are required."); return; }
    setSubmitting(true);
    try {
      await api.auth.register({
        username, password, first_name: firstName, last_name: lastName,
        email, role: "trainer",
        trainer_profile: { specialization: spec, schedule },
      });
      await load();
      setShowForm(false);
      setUsername(""); setPassword(""); setFirstName(""); setLastName(""); setEmail("");
      flash("ok", "Trainer added successfully!");
    } catch (e: any) { flash("err", e.message); }
    finally { setSubmitting(false); }
  };

  const openEditTrainer = (t: any) => {
    setEditTrainer(t);
    setEditFirstName(t.user?.first_name ?? t.full_name?.split(" ")[0] ?? "");
    setEditLastName(t.user?.last_name ?? t.full_name?.split(" ").slice(1).join(" ") ?? "");
    setEditEmail(t.user?.email ?? t.email ?? "");
    setEditPhone(t.user?.phone ?? "");
    setEditSpec(t.specialization ?? "general");
    setEditSchedule(t.schedule ?? "6:00 AM – 2:00 PM");
    setEditAvailability(t.availability ?? true);
    setEditBio(t.bio ?? "");
  };

  const handleSaveEdit = async () => {
    if (!editTrainer) return;
    setSubmitting(true);
    try {
      const payload = {
        specialization: editSpec,
        schedule: editSchedule,
        availability: editAvailability,
        bio: editBio,
        user: {
          first_name: editFirstName,
          last_name: editLastName,
          email: editEmail,
          phone: editPhone
        }
      };
      await api.trainers.update(editTrainer.id, payload);
      await load();
      setEditTrainer(null);
      flash("ok", "Trainer updated successfully!");
    } catch (e: any) {
      flash("err", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrainer = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this trainer? This will remove their profile and user account.")) return;
    setSubmitting(true);
    try {
      await api.trainers.delete(id);
      await load();
      setEditTrainer(null);
      flash("ok", "Trainer deleted successfully!");
    } catch (e: any) {
      flash("err", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="page-header-label mb-1">Admin · Trainers</div>
          <h1 className="text-4xl font-black" style={D}>TRAINER MANAGEMENT</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, delete, and view gym trainers and their specializations.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <UserPlus className="w-4 h-4" /> Add Trainer
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Trainers", val: trainers.length, icon: Trophy, c: "bg-indigo-400/10 text-indigo-400" },
          { label: "Available", val: trainers.filter(t => t.availability).length, icon: CheckCircle2, c: "bg-emerald-400/10 text-emerald-400" },
          { label: "Total Trainees", val: trainers.reduce((acc, t) => acc + (t.trainee_count ?? 0), 0), icon: Users, c: "bg-amber-400/10 text-amber-400" },
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

      {/* Trainer cards */}
      {trainers.length === 0 ? (
        <div className="card-base p-12 text-center text-muted-foreground text-sm">No trainers added yet. Click "Add Trainer" to get started.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainers.map((t: any, i) => (
            <motion.div key={t.id} className="card-base p-5 card-hover flex flex-col justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-400/10 text-indigo-400 font-black text-xl flex items-center justify-center animate-pulse" style={D}>
                      {(t.full_name || "T")[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{t.full_name}</div>
                      <div className="text-xs text-muted-foreground">{t.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEditTrainer(t)} className="btn-ghost p-1 text-muted-foreground hover:text-foreground">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteTrainer(t.id)} className="btn-ghost p-1 text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Specialization</span>
                    <span className="badge badge-indigo capitalize">{t.spec_display || t.specialization}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Schedule</span>
                    <span className="font-medium text-foreground/80">{t.schedule}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trainees</span>
                    <span className="font-bold text-amber-400">{t.trainee_count ?? 0} members</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Availability</span>
                    <span className={`badge ${t.availability ? "badge-green" : "badge-red"}`}>{t.availability ? "Available" : "Busy"}</span>
                  </div>
                </div>
              </div>
              {t.bio && (
                <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground italic line-clamp-2">
                  "{t.bio}"
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Trainer Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div className="relative glass-strong rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title flex items-center gap-2"><UserPlus className="w-5 h-5 text-amber-400" /> Add New Trainer</h3>
                <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">First Name *</label>
                    <input className="input-base" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Rajesh" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Last Name</label>
                    <input className="input-base" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Kumar" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Username *</label>
                  <input className="input-base" value={username} onChange={e => setUsername(e.target.value)} placeholder="rajesh_trainer" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
                  <input className="input-base" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="rajesh@smartgym.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Password *</label>
                  <input className="input-base" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Specialization</label>
                    <select className="input-base" value={spec} onChange={e => setSpec(e.target.value)}>
                      {SPECS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Schedule</label>
                    <input className="input-base" value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="6:00 AM – 2:00 PM" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleAdd} disabled={submitting} className="btn-primary flex-1">
                    {submitting ? <span className="spinner w-4 h-4 border-2 border-black/30 border-t-black" /> : <><UserPlus className="w-4 h-4" /> Add Trainer</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Trainer Modal */}
      <AnimatePresence>
        {editTrainer && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditTrainer(null)} />
            <motion.div className="relative glass-strong rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title flex items-center gap-2"><Pencil className="w-5 h-5 text-amber-400" /> Edit Trainer: {editTrainer.full_name}</h3>
                <button onClick={() => setEditTrainer(null)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">First Name</label>
                    <input className="input-base" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Last Name</label>
                    <input className="input-base" value={editLastName} onChange={e => setEditLastName(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
                    <input className="input-base" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Phone</label>
                    <input className="input-base" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Specialization</label>
                    <select className="input-base" value={editSpec} onChange={e => setEditSpec(e.target.value)}>
                      {SPECS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Schedule</label>
                    <input className="input-base" value={editSchedule} onChange={e => setEditSchedule(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Bio</label>
                  <textarea className="input-base min-h-[80px]" value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Tell us about the trainer's background and experience..." />
                </div>
                <div className="flex items-center gap-2 pt-1 pb-2">
                  <input type="checkbox" id="editAvailability" checked={editAvailability} onChange={e => setEditAvailability(e.target.checked)} className="rounded border-border bg-background text-amber-500 focus:ring-amber-500 w-4 h-4" />
                  <label htmlFor="editAvailability" className="text-xs font-semibold text-foreground/80 cursor-pointer">Available (Active in gym)</label>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border">
                  <button onClick={() => handleDeleteTrainer(editTrainer.id)} className="btn-secondary text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40 sm:w-1/3 order-3 sm:order-1">
                    <Trash2 className="w-4 h-4 inline-block mr-1" /> Delete
                  </button>
                  <div className="flex-1" />
                  <div className="flex gap-2 sm:w-1/2 order-2">
                    <button onClick={() => setEditTrainer(null)} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={handleSaveEdit} disabled={submitting} className="btn-primary flex-1">
                      {submitting ? <span className="spinner w-4 h-4 border-2 border-black/30 border-t-black" /> : "Save Changes"}
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
