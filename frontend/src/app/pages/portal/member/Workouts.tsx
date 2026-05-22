import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dumbbell, Plus, Target, Activity, Droplets, Scale, Flame, CheckCircle2, AlertCircle, Clock, Calendar, Heart } from "lucide-react";
import { api } from "../../../store/api";

const D = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };
const EXERCISE_TYPES = ["strength","cardio","yoga","hiit","crossfit","pilates","swimming","cycling","general"];
const INTENSITIES = ["low","medium","high"] as const;
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function MemberWorkouts() {
  const [profile, setProfile] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [assignedPlan, setAssignedPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [tab, setTab] = useState<"log" | "plan" | "history" | "goals">("log");

  // Workout form
  const [exType, setExType] = useState("strength");
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<"low"|"medium"|"high">("medium");
  const [logLoading, setLogLoading] = useState(false);

  // Goals form
  const [goalWeight, setGoalWeight] = useState(65);
  const [calTarget, setCalTarget] = useState(2200);
  const [waterIntake, setWaterIntake] = useState(4);
  const [savingGoals, setSavingGoals] = useState(false);

  const flash = (type: "ok" | "err", text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = async () => {
    const [p, w, plans] = await Promise.all([
      api.members.getMe().catch(() => null),
      api.workouts.list().catch(() => []),
      api.workouts.listPlans().catch(() => []),
    ]);
    setProfile(p);
    setWorkouts(Array.isArray(w) ? w : w?.results ?? []);
    if (p) { setGoalWeight(p.target_weight_kg ?? 65); setCalTarget(p.calorie_target ?? 2200); setWaterIntake(p.water_intake ?? 4); }
    if (plans && plans.length > 0) {
      setAssignedPlan(plans[0]);
    }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleLog = async () => {
    setLogLoading(true);
    try {
      await api.workouts.log({ exercise_type: exType, duration_min: duration, intensity });
      await load();
      flash("ok", "Workout logged! Calories predicted by ML model.");
    } catch (e: any) { flash("err", e.message); }
    finally { setLogLoading(false); }
  };

  const handleSaveGoals = async () => {
    if (!profile?.id) return;
    setSavingGoals(true);
    try {
      await api.members.update(profile.id, { target_weight_kg: goalWeight, calorie_target: calTarget });
      await api.members.updateWater(profile.id, waterIntake);
      await load();
      flash("ok", "Goals saved!");
    } catch (e: any) { flash("err", e.message); }
    finally { setSavingGoals(false); }
  };

  const bmi = profile?.bmi ?? 0;
  const bmiColor = bmi < 18.5 ? "text-sky-400" : bmi < 25 ? "text-emerald-400" : bmi < 30 ? "text-amber-400" : "text-rose-400";
  const bmiLabel = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const totalCal = workouts.reduce((a, w) => a + (w.calories_burned ?? 0), 0);
  const weightDiff = profile ? Math.abs(profile.weight_kg - profile.target_weight_kg) : 0;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="page-header-label mb-1">Member · Workouts</div>
        <h1 className="text-4xl font-black" style={D}>WORKOUTS & GOALS</h1>
        <p className="text-sm text-muted-foreground mt-1">Log sessions, view personalized plans, and track fitness goals.</p>
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

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Sessions", val: workouts.length, icon: Dumbbell, c: "bg-amber-400/10 text-amber-400" },
          { label: "Total Calories", val: `${Math.round(totalCal)}`, icon: Flame, c: "bg-rose-400/10 text-rose-400" },
          { label: "BMI", val: bmi, icon: Scale, c: `bg-emerald-400/10 ${bmiColor}` },
          { label: "Water Goal", val: `${profile?.water_intake ?? 0} glasses`, icon: Droplets, c: "bg-sky-400/10 text-sky-400" },
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-xl border border-border w-fit">
        {[
          ["log", "Log Workout"],
          ["plan", "Assigned Plan"],
          ["history", "History"],
          ["goals", "Goals & BMI"]
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === key ? "bg-amber-500 text-black shadow-md font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Log Workout */}
      {tab === "log" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card-base p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2"><Dumbbell className="w-5 h-5 text-amber-400" /><h3 className="section-title">Log a Workout</h3></div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Exercise Type</label>
              <select className="input-base" value={exType} onChange={e => setExType(e.target.value)}>
                {EXERCISE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration: <span className="text-amber-400">{duration} min</span></label>
              <input type="range" min={5} max={120} step={5} value={duration} onChange={e => setDuration(+e.target.value)} className="w-full accent-amber-500 cursor-pointer" />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>5 min</span><span>120 min</span></div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Intensity</label>
              <div className="flex gap-2">
                {INTENSITIES.map(i => (
                  <button key={i} type="button" onClick={() => setIntensity(i)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all capitalize ${
                      intensity === i
                        ? i === "high" ? "bg-rose-500/15 border-rose-500/50 text-rose-400"
                          : i === "medium" ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                          : "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}>{i}</button>
                ))}
              </div>
            </div>
            <button onClick={handleLog} disabled={logLoading} className="btn-primary w-full py-3">
              {logLoading ? <span className="spinner w-4 h-4 border-2 border-black/30 border-t-black" /> : <><Plus className="w-4 h-4" /> Log & Predict Calories</>}
            </button>
          </div>
          <div className="card-base p-6">
            <div className="flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-amber-400" /><h3 className="section-title">Recent Sessions</h3></div>
            {workouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No workouts yet. Log your first one!</div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {workouts.slice(0, 8).map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0"><Dumbbell className="w-4 h-4" /></div>
                      <div>
                        <div className="font-semibold text-sm capitalize">{w.exercise_type}</div>
                        <div className="text-xs text-muted-foreground">{w.duration_min} min · <span className="capitalize">{w.intensity}</span></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-amber-400" style={D}>{Math.round(w.calories_burned ?? 0)}</div>
                      <div className="text-[10px] text-muted-foreground">kcal</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assigned Plan */}
      {tab === "plan" && (
        <div className="space-y-5">
          {!assignedPlan ? (
            <div className="card-base p-12 text-center text-muted-foreground text-sm">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              No workout plan has been assigned to you yet. 
              <p className="text-xs mt-1">Once your assigned trainer designs a routine for you, it will appear here.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header card */}
              <div className="card-base p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="section-title text-xl mb-1">{assignedPlan.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Assigned by Trainer: <strong className="text-foreground">{assignedPlan.trainer_name}</strong> · Updated {new Date(assignedPlan.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Difficulty:</span>
                  <span className={`badge uppercase ${
                    assignedPlan.difficulty === "advanced" ? "badge-rose" : assignedPlan.difficulty === "intermediate" ? "badge-amber" : "badge-green"
                  }`}>{assignedPlan.difficulty}</span>
                </div>
              </div>

              {/* Weekly schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAYS.map((day, i) => {
                  const r = assignedPlan.routines?.[day] || { muscle_group: "Rest Day", exercises: "", is_rest_day: true };
                  return (
                    <motion.div key={day} className={`card-base p-5 border transition-all ${
                      r.is_rest_day 
                        ? "border-emerald-500/10 bg-emerald-500/[0.01] hover:border-emerald-500/20" 
                        : "border-border hover:border-amber-500/30"
                    }`}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{day}</span>
                        {r.is_rest_day ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                            <Heart className="w-3 h-3" /> Rest Day
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-400 capitalize">{r.muscle_group}</span>
                        )}
                      </div>
                      {!r.is_rest_day && r.exercises && (
                        <div className="space-y-2 mt-3">
                          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Assigned Exercises:</div>
                          <ul className="text-sm text-foreground/80 space-y-1 pl-4 list-disc">
                            {r.exercises.split(",").map((ex: string, idx: number) => (
                              <li key={idx} className="leading-snug">{ex.trim()}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {!r.is_rest_day && !r.exercises && (
                        <div className="text-xs text-muted-foreground italic mt-2">No specific exercises listed. Focus on {r.muscle_group}.</div>
                      )}
                      {r.is_rest_day && (
                        <p className="text-xs text-muted-foreground italic mt-2">Give your body a chance to recover. Focus on stretch, hydration, and light walking.</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Trainer notes */}
              {assignedPlan.notes && (
                <div className="card-base p-5 border-indigo-500/20 bg-indigo-500/[0.02]">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Trainer's Guidance Notes</h4>
                  <p className="text-sm italic text-muted-foreground font-serif">"{assignedPlan.notes}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="card-base overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="section-title flex items-center gap-2"><Activity className="w-5 h-5 text-amber-400" /> Full Workout History</h3>
            <span className="badge badge-indigo">{workouts.length} sessions</span>
          </div>
          {workouts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No workouts logged yet.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Exercise</th><th>Duration</th><th>Intensity</th><th className="text-right">Calories (ML)</th></tr></thead>
              <tbody>
                {workouts.map((w: any) => (
                  <tr key={w.id}>
                    <td className="font-semibold capitalize">{w.exercise_type}</td>
                    <td className="text-muted-foreground">{w.duration_min} min</td>
                    <td><span className={`badge ${w.intensity === "high" ? "badge-rose" : w.intensity === "medium" ? "badge-amber" : "badge-green"}`}>{w.intensity}</span></td>
                    <td className="text-right font-black text-amber-400 text-base" style={D}>{Math.round(w.calories_burned ?? 0)} kcal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Goals & BMI */}
      {tab === "goals" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card-base p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2"><Target className="w-5 h-5 text-amber-400" /><h3 className="section-title">Fitness Goals</h3></div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Weight (kg)</label>
              <input className="input-base" type="number" value={goalWeight} onChange={e => setGoalWeight(+e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Calorie Target (kcal)</label>
              <input className="input-base" type="number" value={calTarget} onChange={e => setCalTarget(+e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Water Intake: <span className="text-sky-400">{waterIntake} glasses/day</span></label>
              <input type="range" min={1} max={12} value={waterIntake} onChange={e => setWaterIntake(+e.target.value)} className="w-full accent-sky-500 cursor-pointer" />
            </div>
            <button onClick={handleSaveGoals} disabled={savingGoals} className="btn-primary w-full">
              {savingGoals ? <span className="spinner w-4 h-4 border-2 border-black/30 border-t-black" /> : <><CheckCircle2 className="w-4 h-4" /> Save Goals</>}
            </button>
          </div>
          <div className="space-y-4">
            {/* BMI */}
            <div className="card-base p-5">
              <div className="flex items-center gap-2 mb-3"><Scale className="w-5 h-5 text-amber-400" /><h3 className="section-title text-base">BMI Status</h3></div>
              <div className="flex items-end gap-3 mb-3">
                <span className={`text-5xl font-black ${bmiColor}`} style={D}>{bmi}</span>
                <span className={`badge ${bmi < 18.5 ? "badge-sky" : bmi < 25 ? "badge-green" : bmi < 30 ? "badge-amber" : "badge-red"} text-sm py-1`}>{bmiLabel}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill transition-all" style={{ width: `${Math.min(100,(bmi/40)*100)}%`, background: bmi < 18.5 ? "#38bdf8" : bmi < 25 ? "#10b981" : bmi < 30 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>16</span><span>18.5</span><span>25</span><span>30</span><span>40+</span></div>
            </div>
            {/* Weight goal */}
            <div className="card-base p-5">
              <div className="flex items-center gap-2 mb-3"><Target className="w-5 h-5 text-amber-400" /><h3 className="section-title text-base">Weight Goal</h3></div>
              <div className="flex justify-between text-sm mb-2">
                <span>Current: <strong>{profile?.weight_kg ?? "—"} kg</strong></span>
                <span>Target: <strong>{profile?.target_weight_kg ?? "—"} kg</strong></span>
              </div>
              <div className="progress-track mb-1"><div className="progress-fill bg-amber-500" style={{ width: `${Math.max(10, 100 - weightDiff * 5)}%` }} /></div>
              <div className="text-xs text-muted-foreground">{weightDiff.toFixed(1)} kg to reach your goal</div>
            </div>
            {/* Calorie target */}
            <div className="card-base p-5">
              <div className="flex items-center gap-2 mb-2"><Flame className="w-5 h-5 text-amber-400" /><h3 className="section-title text-base">Calorie Target</h3></div>
              <div className="text-4xl font-black text-amber-400" style={D}>{profile?.calorie_target ?? "—"} <span className="text-xl text-muted-foreground">kcal/day</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
