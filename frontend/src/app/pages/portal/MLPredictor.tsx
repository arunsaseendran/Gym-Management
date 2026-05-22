import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain, Flame, Heart, Thermometer, Clock, User,
  Ruler, Weight, ChevronRight, TrendingUp, History,
  AlertCircle, CheckCircle2, Zap,
} from "lucide-react";
import { api } from "../../store/api";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const DISPLAY = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };

function SliderField({ label, icon: Icon, value, min, max, step = 1, unit, onChange }: any) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Icon className="w-3.5 h-3.5" /> {label}
        </label>
        <span className="text-sm font-bold text-amber-400">{value}<span className="text-xs text-muted-foreground ml-1">{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        className="w-full accent-amber-500 cursor-pointer h-1.5" />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function MLPredictor() {
  const [profile, setProfile] = useState<any>(null);
  // Inputs
  const [age, setAge]           = useState(25);
  const [gender, setGender]     = useState("male");
  const [height, setHeight]     = useState(170);
  const [weight, setWeight]     = useState(70);
  const [duration, setDuration] = useState(30);
  const [heartRate, setHR]      = useState(120);
  const [bodyTemp, setTemp]     = useState(37.5);

  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [history, setHistory]   = useState<any[]>([]);
  const [tab, setTab]           = useState<"predict" | "history">("predict");
  const [error, setError]       = useState("");

  useEffect(() => {
    (async () => {
      const [p, h] = await Promise.all([
        api.members.getMe().catch(() => null),
        api.predictor.history().catch(() => []),
      ]);
      if (p) {
        setProfile(p);
        setAge(p.age ?? 25);
        setGender(p.gender ?? "male");
        setHeight(p.height_cm ?? 170);
        setWeight(p.weight_kg ?? 70);
      }
      const raw = Array.isArray(h) ? h : h?.results ?? [];
      setHistory(raw);
    })();
  }, []);

  const handlePredict = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await api.predictor.predict({ age, gender, height, weight, duration, heart_rate: heartRate, body_temp: bodyTemp });
      setResult(data);
      const h = await api.predictor.history().catch(() => []);
      setHistory(Array.isArray(h) ? h : h?.results ?? []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const chartData = history.slice(0, 20).reverse().map((h: any, i: number) => ({
    i: i + 1,
    cal: Math.round(h.predicted_calories ?? 0),
    date: h.date_str || h.date || "",
  }));

  const calColor = (cal: number) =>
    cal < 200 ? "#38bdf8" : cal < 400 ? "#10b981" : cal < 600 ? "#f59e0b" : "#ef4444";

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <div className="page-header-label mb-1">Machine Learning</div>
        <h1 className="text-4xl font-black" style={DISPLAY}>AI CALORIE PREDICTOR</h1>
        <p className="text-sm text-muted-foreground mt-1">scikit-learn model trained on exercise biometrics data.</p>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-xl border border-border w-fit">
        <button onClick={() => setTab("predict")} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "predict" ? "bg-amber-500 text-black" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
          Predict
        </button>
        <button onClick={() => setTab("history")} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "history" ? "bg-amber-500 text-black" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
          History ({history.length})
        </button>
      </div>

      {tab === "predict" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Input form */}
          <div className="lg:col-span-3 card-base p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-amber-400" />
              <h3 className="section-title">Input Parameters</h3>
            </div>

            {/* Static inputs row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><User className="w-3.5 h-3.5" /> Age</label>
                <input type="number" className="input-base" value={age} onChange={e => setAge(+e.target.value)} min={10} max={100} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender</label>
                <div className="flex gap-2">
                  {["male","female","other"].map(g => (
                    <button key={g} type="button" onClick={() => setGender(g)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all capitalize ${
                        gender === g ? "bg-amber-500/15 border-amber-500/50 text-amber-400" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> Height (cm)</label>
                <input type="number" className="input-base" value={height} onChange={e => setHeight(+e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Weight className="w-3.5 h-3.5" /> Weight (kg)</label>
                <input type="number" className="input-base" value={weight} onChange={e => setWeight(+e.target.value)} />
              </div>
            </div>

            <div className="divider" />

            {/* Sliders */}
            <SliderField label="Workout Duration" icon={Clock}       value={duration}  min={5}   max={120} unit=" min" onChange={setDuration} />
            <SliderField label="Heart Rate"        icon={Heart}       value={heartRate} min={60}  max={200} unit=" bpm" onChange={setHR} />
            <SliderField label="Body Temperature"  icon={Thermometer} value={bodyTemp}  min={36}  max={41}  step={0.1} unit="°C" onChange={setTemp} />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/8 border border-destructive/25 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <button onClick={handlePredict} disabled={loading} className="btn-primary w-full py-3.5 text-base"
              style={{ boxShadow: loading ? "none" : "0 0 28px rgba(245,158,11,0.25)" }}>
              {loading
                ? <><span className="spinner w-5 h-5 border-2 border-black/30 border-t-black" /> Running ML Model…</>
                : <><Brain className="w-5 h-5" /> Predict Calories</>}
            </button>
          </div>

          {/* Result panel */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="card-base p-6 text-center border-amber-500/30"
                  style={{ boxShadow: "0 0 40px rgba(245,158,11,0.12)" }}
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Prediction Complete</span>
                  </div>
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4"
                    style={{ background: `radial-gradient(circle, ${calColor(result.predicted_calories)}22, transparent)`, border: `2px solid ${calColor(result.predicted_calories)}44` }}>
                    <Flame className="w-8 h-8" style={{ color: calColor(result.predicted_calories) }} />
                  </div>
                  <div className="text-6xl font-black mb-1" style={{ ...DISPLAY, color: calColor(result.predicted_calories) }}>
                    {Math.round(result.predicted_calories)}
                  </div>
                  <div className="text-muted-foreground text-sm font-medium mb-6">kilocalories burned</div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    {[
                      ["Duration", `${result.inputs?.duration} min`],
                      ["Heart Rate", `${result.inputs?.heart_rate} bpm`],
                      ["Body Temp", `${result.inputs?.body_temp}°C`],
                      ["Weight", `${result.inputs?.weight} kg`],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-muted/50 rounded-xl p-2.5 border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">{l}</div>
                        <div className="text-sm font-bold mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-400">
                    <Zap className="w-3.5 h-3.5 inline mr-1" />
                    {result.predicted_calories < 200 ? "Light activity – consider increasing intensity."
                      : result.predicted_calories < 400 ? "Good moderate workout session."
                      : result.predicted_calories < 600 ? "Excellent high-intensity session!"
                      : "Elite performance – ensure proper recovery."}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" className="card-base p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">Set your parameters and click Predict to run the ML model.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick presets */}
            <div className="card-base p-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Quick Presets</div>
              <div className="space-y-2">
                {[
                  { label: "Light Walk",     duration: 20, hr: 90,  temp: 36.8 },
                  { label: "Moderate Cardio",duration: 45, hr: 130, temp: 37.5 },
                  { label: "HIIT Session",   duration: 30, hr: 170, temp: 38.5 },
                  { label: "Heavy Lifting",  duration: 60, hr: 150, temp: 38.0 },
                ].map(p => (
                  <button key={p.label} onClick={() => { setDuration(p.duration); setHR(p.hr); setTemp(p.temp); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-left">
                    <span className="text-sm font-medium">{p.label}</span>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{p.duration}m</span>
                      <span>{p.hr}bpm</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-5">
          {history.length === 0 ? (
            <div className="card-base p-12 text-center">
              <History className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">No prediction history yet. Run your first prediction!</p>
            </div>
          ) : (
            <>
              {chartData.length > 1 && (
                <div className="card-base p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    <h3 className="section-title">Calorie Trend</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip contentStyle={{ background: "#0b0d17", border: "1px solid rgba(238,242,255,0.08)", borderRadius: 10, fontSize: 12 }}
                        formatter={(v: any) => [`${v} kcal`, "Calories"]} />
                      <Area type="monotone" dataKey="cal" stroke="#f59e0b" strokeWidth={2} fill="url(#cGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="card-base overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <h3 className="section-title flex items-center gap-2"><History className="w-5 h-5 text-amber-400" /> Prediction Log</h3>
                  <span className="badge badge-indigo">{history.length} records</span>
                </div>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Duration</th><th>Heart Rate</th><th>Body Temp</th><th>Weight</th><th className="text-right">Calories</th></tr></thead>
                  <tbody>
                    {history.map((h: any) => (
                      <tr key={h.id}>
                        <td className="text-muted-foreground">{h.date_str || h.date}</td>
                        <td>{h.duration} min</td>
                        <td>{h.heart_rate} bpm</td>
                        <td>{h.body_temp}°C</td>
                        <td>{h.weight} kg</td>
                        <td className="text-right">
                          <span className="font-black text-base" style={{ ...DISPLAY, color: calColor(h.predicted_calories) }}>
                            {Math.round(h.predicted_calories)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">kcal</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
