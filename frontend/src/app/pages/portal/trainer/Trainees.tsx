import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Send, X, Dumbbell, Scale, CheckCircle2, AlertCircle, MessageSquare, Calendar, Utensils } from "lucide-react";
import { api } from "../../../store/api";

const D = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function TrainerTrainees() {
  const [trainees, setTrainees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  
  // Advice Modal state
  const [adviceMember, setAdviceMember] = useState<any | null>(null);
  const [adviceText, setAdviceText] = useState("");
  const [sending, setSending] = useState(false);

  // Workout Plan Modal state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<any | null>(null);
  const [planName, setPlanName] = useState("Weekly Workout Plan");
  const [planDiff, setPlanDiff] = useState("intermediate");
  const [planNotes, setPlanNotes] = useState("");
  const [planRoutines, setPlanRoutines] = useState<any>({
    monday: { muscle_group: "Chest + Triceps", exercises: "", is_rest_day: false },
    tuesday: { muscle_group: "Cardio", exercises: "", is_rest_day: false },
    wednesday: { muscle_group: "Legs", exercises: "", is_rest_day: false },
    thursday: { muscle_group: "Rest Day", exercises: "", is_rest_day: true },
    friday: { muscle_group: "Back + Biceps", exercises: "", is_rest_day: false },
    saturday: { muscle_group: "Shoulders", exercises: "", is_rest_day: false },
    sunday: { muscle_group: "Rest Day", exercises: "", is_rest_day: true },
  });
  const [savingPlan, setSavingPlan] = useState(false);

  // Diet Plan Modal state
  const [showDietModal, setShowDietModal] = useState(false);
  const [dietName, setDietName] = useState("Daily Diet Plan");
  const [dietBreakfast, setDietBreakfast] = useState("");
  const [dietLunch, setDietLunch] = useState("");
  const [dietDinner, setDietDinner] = useState("");
  const [dietSnack, setDietSnack] = useState("");
  const [dietWater, setDietWater] = useState("3 litres daily");
  const [dietNotes, setDietNotes] = useState("");
  const [savingDiet, setSavingDiet] = useState(false);

  const flash = (type: "ok" | "err", text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const loadTrainees = () => {
    api.trainers.getTrainees().catch(() => [])
      .then(d => setTrainees(Array.isArray(d) ? d : d?.results ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTrainees(); }, []);

  const handleSendAdvice = async () => {
    if (!adviceMember || !adviceText.trim()) return;
    setSending(true);
    try {
      await api.trainers.sendAdvice(adviceMember.id, adviceText.trim());
      setAdviceMember(null); setAdviceText("");
      flash("ok", "Advice sent to " + (adviceMember.full_name || adviceMember.user_name));
    } catch (e: any) { flash("err", e.message); }
    finally { setSending(false); }
  };

  const openWorkoutPlanModal = async (member: any) => {
    setSelectedTrainee(member);
    try {
      const plans = await api.workouts.listPlans(member.id);
      if (plans && plans.length > 0) {
        const latest = plans[0];
        setPlanName(latest.name || "Weekly Workout Plan");
        setPlanDiff(latest.difficulty || "intermediate");
        setPlanNotes(latest.notes || "");
        setPlanRoutines(latest.routines || {});
      } else {
        setPlanName("Weekly Workout Plan");
        setPlanDiff("intermediate");
        setPlanNotes("");
        setPlanRoutines({
          monday: { muscle_group: "Chest + Triceps", exercises: "", is_rest_day: false },
          tuesday: { muscle_group: "Cardio", exercises: "", is_rest_day: false },
          wednesday: { muscle_group: "Legs", exercises: "", is_rest_day: false },
          thursday: { muscle_group: "Rest Day", exercises: "", is_rest_day: true },
          friday: { muscle_group: "Back + Biceps", exercises: "", is_rest_day: false },
          saturday: { muscle_group: "Shoulders", exercises: "", is_rest_day: false },
          sunday: { muscle_group: "Rest Day", exercises: "", is_rest_day: true },
        });
      }
    } catch (e) {
      setPlanRoutines({
        monday: { muscle_group: "Chest + Triceps", exercises: "", is_rest_day: false },
        tuesday: { muscle_group: "Cardio", exercises: "", is_rest_day: false },
        wednesday: { muscle_group: "Legs", exercises: "", is_rest_day: false },
        thursday: { muscle_group: "Rest Day", exercises: "", is_rest_day: true },
        friday: { muscle_group: "Back + Biceps", exercises: "", is_rest_day: false },
        saturday: { muscle_group: "Shoulders", exercises: "", is_rest_day: false },
        sunday: { muscle_group: "Rest Day", exercises: "", is_rest_day: true },
      });
    }
    setShowPlanModal(true);
  };

  const openDietPlanModal = async (member: any) => {
    setSelectedTrainee(member);
    try {
      const diets = await api.workouts.listDiets(member.id);
      if (diets && diets.length > 0) {
        const latest = diets[0];
        setDietName(latest.name || "Daily Diet Plan");
        setDietBreakfast(latest.breakfast || "");
        setDietLunch(latest.lunch || "");
        setDietDinner(latest.dinner || "");
        setDietSnack(latest.snack || "");
        setDietWater(latest.water_intake || "3 litres daily");
        setDietNotes(latest.notes || "");
      } else {
        // Pre-fill placeholder based on BMI label
        const bmi = member.bmi ?? 22;
        const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
        setDietName(`${label} Diet Plan`);
        setDietBreakfast("");
        setDietLunch("");
        setDietDinner("");
        setDietSnack("");
        setDietWater("3 litres daily");
        setDietNotes("");
      }
    } catch (e) {
      setDietName("Daily Diet Plan");
      setDietBreakfast("");
      setDietLunch("");
      setDietDinner("");
      setDietSnack("");
      setDietWater("3 litres daily");
      setDietNotes("");
    }
    setShowDietModal(true);
  };

  const updateRoutine = (day: string, field: string, val: any) => {
    setPlanRoutines((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: val,
        ...(field === "is_rest_day" && val ? { muscle_group: "Rest Day", exercises: "" } : {}),
        ...(field === "is_rest_day" && !val ? { muscle_group: "General Training", exercises: "" } : {})
      }
    }));
  };

  const handleSavePlan = async () => {
    if (!selectedTrainee) return;
    setSavingPlan(true);
    try {
      const existing = await api.workouts.listPlans(selectedTrainee.id);
      if (existing && existing.length > 0) {
        await api.workouts.updatePlan(existing[0].id, {
          name: planName,
          difficulty: planDiff,
          notes: planNotes,
          routines: planRoutines
        });
      } else {
        await api.workouts.createPlan({
          member: selectedTrainee.id,
          name: planName,
          difficulty: planDiff,
          notes: planNotes,
          routines: planRoutines
        });
      }
      setShowPlanModal(false);
      flash("ok", "Workout plan assigned to " + (selectedTrainee.full_name || selectedTrainee.user_name));
    } catch (e: any) {
      flash("err", e.message);
    } finally {
      setSavingPlan(false);
    }
  };

  const handleSaveDiet = async () => {
    if (!selectedTrainee) return;
    setSavingDiet(true);
    try {
      const existing = await api.workouts.listDiets(selectedTrainee.id);
      const payload = {
        name: dietName,
        breakfast: dietBreakfast,
        lunch: dietLunch,
        dinner: dietDinner,
        snack: dietSnack,
        water_intake: dietWater,
        notes: dietNotes
      };
      if (existing && existing.length > 0) {
        await api.workouts.updateDiet(existing[0].id, payload);
      } else {
        await api.workouts.createDiet({
          member: selectedTrainee.id,
          ...payload
        });
      }
      setShowDietModal(false);
      flash("ok", "Diet plan assigned to " + (selectedTrainee.full_name || selectedTrainee.user_name));
    } catch (e: any) {
      flash("err", e.message);
    } finally {
      setSavingDiet(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="page-header-label mb-1">Trainer · Trainees</div>
          <h1 className="text-4xl font-black" style={D}>MY TRAINEES</h1>
          <p className="text-sm text-muted-foreground mt-1">View stats, assign workout routines, and manage diet plans.</p>
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
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Trainees", val: trainees.length, c: "bg-amber-400/10 text-amber-400", icon: Users },
          { label: "Active", val: trainees.filter(t => t.status === "active").length, c: "bg-emerald-400/10 text-emerald-400", icon: CheckCircle2 },
          { label: "Avg BMI", val: trainees.length ? (trainees.reduce((a, t) => a + (t.bmi ?? 0), 0) / trainees.length).toFixed(1) : "—", c: "bg-indigo-400/10 text-indigo-400", icon: Scale },
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

      {trainees.length === 0 ? (
        <div className="card-base p-12 text-center text-muted-foreground text-sm">No trainees assigned to you yet. Ask admin to assign members.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {trainees.map((t: any, i) => (
            <motion.div key={t.id} className="card-base p-5 flex flex-col justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div>
                <div className="flex items-start gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-amber text-black font-black text-xl flex items-center justify-center shrink-0" style={D}>
                      {(t.full_name || t.user_name || "M")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base truncate">{t.full_name || t.user_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openWorkoutPlanModal(t)} className="btn-ghost p-2 shrink-0 text-amber-400 hover:bg-amber-500/10" title="Assign Workout Plan">
                      <Dumbbell className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDietPlanModal(t)} className="btn-ghost p-2 shrink-0 text-emerald-400 hover:bg-emerald-500/10" title="Assign Diet Plan">
                      <Utensils className="w-4 h-4" />
                    </button>
                    <button onClick={() => setAdviceMember(t)} className="btn-ghost p-2 shrink-0 text-indigo-400 hover:bg-indigo-500/10" title="Send Advice">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className={`badge ${t.status === "active" ? "badge-green" : "badge-amber"}`}>{t.status}</span>
                  <span className="badge badge-indigo text-[10px]">{t.membership_plan?.replace(/_/g, " ")}</span>
                  {t.slot_label && <span className="badge badge-sky text-[10px]">{t.slot_label}</span>}
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                  {[
                    ["BMI", t.bmi ?? "—"],
                    ["Weight", t.weight_kg ? `${t.weight_kg}kg` : "—"],
                    ["Target", t.target_weight_kg ? `${t.target_weight_kg}kg` : "—"],
                    ["Calories", t.calorie_target ? `${t.calorie_target}` : "—"],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-muted/50 rounded-xl py-2 px-1 border border-border">
                      <div className="text-[9px] text-muted-foreground uppercase font-bold">{l}</div>
                      <div className="text-sm font-bold mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Advice Modal */}
      <AnimatePresence>
        {adviceMember && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAdviceMember(null)} />
            <motion.div className="relative glass-strong rounded-2xl p-6 w-full max-w-md" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title flex items-center gap-2"><Send className="w-5 h-5 text-amber-400" /> Send Advice</h3>
                <button onClick={() => setAdviceMember(null)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">To: <strong className="text-foreground">{adviceMember.full_name || adviceMember.user_name}</strong></p>
              <textarea value={adviceText} onChange={e => setAdviceText(e.target.value)} rows={4}
                placeholder="Write workout tips, dietary advice, or form corrections…" className="input-base resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setAdviceMember(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSendAdvice} disabled={sending || !adviceText.trim()} className="btn-primary flex-1">
                  {sending ? <span className="spinner w-4 h-4 border-2 border-black/30 border-t-black" /> : <><Send className="w-4 h-4" /> Send Advice</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout Plan Modal */}
      <AnimatePresence>
        {showPlanModal && selectedTrainee && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPlanModal(false)} />
            <motion.div className="relative glass-strong rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  Assign Workout Plan: {selectedTrainee.full_name || selectedTrainee.user_name}
                </h3>
                <button onClick={() => setShowPlanModal(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Plan Name</label>
                    <input className="input-base" value={planName} onChange={e => setPlanName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Difficulty Level</label>
                    <select className="input-base" value={planDiff} onChange={e => setPlanDiff(e.target.value)}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Overall Plan Notes (Optional)</label>
                  <textarea className="input-base min-h-[60px]" value={planNotes} onChange={e => setPlanNotes(e.target.value)} placeholder="Provide tips on hydration, sleep, or calorie intake for this plan..." />
                </div>

                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-3">Weekly Schedule</span>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 border-y border-border/50 py-3">
                    {DAYS.map(day => {
                      const r = planRoutines[day] || { muscle_group: "", exercises: "", is_rest_day: false };
                      return (
                        <div key={day} className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{day}</span>
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                              <input type="checkbox" checked={r.is_rest_day} onChange={e => updateRoutine(day, "is_rest_day", e.target.checked)} className="rounded border-border bg-background text-amber-500 focus:ring-amber-500 w-3.5 h-3.5" />
                              Rest Day
                            </label>
                          </div>
                          {!r.is_rest_day && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Muscle Group Focus</label>
                                <input value={r.muscle_group} onChange={e => updateRoutine(day, "muscle_group", e.target.value)} placeholder="e.g. Chest + Triceps" className="input-base text-xs py-1.5" />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Exercises</label>
                                <input value={r.exercises} onChange={e => updateRoutine(day, "exercises", e.target.value)} placeholder="e.g. Bench Press 4x10, Dips 3x12" className="input-base text-xs py-1.5" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowPlanModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleSavePlan} disabled={savingPlan} className="btn-primary flex-1">
                    {savingPlan ? <span className="spinner w-4 h-4 border-2 border-black/30 border-t-black" /> : "Save & Assign Plan"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diet Plan Modal */}
      <AnimatePresence>
        {showDietModal && selectedTrainee && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDietModal(false)} />
            <motion.div className="relative glass-strong rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto my-8" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-400" />
                  Assign Diet Plan: {selectedTrainee.full_name || selectedTrainee.user_name}
                </h3>
                <button onClick={() => setShowDietModal(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Diet Plan Name</label>
                    <input className="input-base" value={dietName} onChange={e => setDietName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Daily Water Target</label>
                    <input className="input-base" value={dietWater} onChange={e => setDietWater(e.target.value)} placeholder="e.g. 3 litres daily" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Breakfast</label>
                    <textarea className="input-base min-h-[70px] text-sm" value={dietBreakfast} onChange={e => setDietBreakfast(e.target.value)} placeholder="e.g. Oats with banana, 3 egg whites" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Lunch</label>
                    <textarea className="input-base min-h-[70px] text-sm" value={dietLunch} onChange={e => setDietLunch(e.target.value)} placeholder="e.g. Quinoa, double chicken breast, salad" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Dinner</label>
                    <textarea className="input-base min-h-[70px] text-sm" value={dietDinner} onChange={e => setDietDinner(e.target.value)} placeholder="e.g. Salmon or paneer, sweet potatoes, broccoli" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Snacks</label>
                    <textarea className="input-base min-h-[70px] text-sm" value={dietSnack} onChange={e => setDietSnack(e.target.value)} placeholder="e.g. Mixed nuts, protein bar, apple slices" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Trainer Advice & Guidelines (Optional)</label>
                  <textarea className="input-base min-h-[60px]" value={dietNotes} onChange={e => setDietNotes(e.target.value)} placeholder="e.g. Keep a deficit of 300 kcal. Avoid sugary sodas entirely." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowDietModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={handleSaveDiet} disabled={savingDiet} className="btn-primary flex-1">
                    {savingDiet ? <span className="spinner w-4 h-4 border-2 border-black/30 border-t-black" /> : "Save & Assign Diet"}
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
