import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Camera, QrCode, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../../store/api";

const D = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold">{value ?? "—"}</span>
    </div>
  );
}

export default function MemberProfile() {
  const session = api.getSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* QR state */
  const [showQR, setShowQR] = useState(false);

  const flash = (type: "ok" | "err", text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const load = async () => {
    const [p, sl, att] = await Promise.all([
      api.members.getMe().catch(() => null),
      api.slots.list().catch(() => []),
      api.attendance.list().catch(() => []),
    ]);
    setProfile(p);
    setSlots(Array.isArray(sl) ? sl : sl?.results ?? []);
    setAttendance(Array.isArray(att) ? att : att?.results ?? []);
  };

  const today = new Date().toISOString().split("T")[0];
  const todayPunch = attendance.find((a: any) => a.date === today);

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    try {
      await api.members.uploadPhoto(profile.id, file);
      await load();
      flash("ok", "Profile photo updated!");
    } catch { flash("err", "Upload failed."); }
  };

  const handleBookSlot = async (slotId: number) => {
    if (!profile?.id) return;
    try {
      await api.members.bookSlot(profile.id, slotId);
      await load();
      flash("ok", "Slot booked successfully!");
    } catch (e: any) { flash("err", e.message); }
  };

  const bmiCategory = (bmi: number) =>
    bmi < 18.5 ? { label: "Underweight", color: "badge-sky" }
    : bmi < 25  ? { label: "Normal",      color: "badge-green" }
    : bmi < 30  ? { label: "Overweight",  color: "badge-amber" }
    :             { label: "Obese",        color: "badge-red" };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  const bmi = profile?.bmi ?? 0;
  const cat = bmiCategory(bmi);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="page-header-label mb-1">Member · Profile</div>
          <h1 className="text-4xl font-black" style={D}>MY PROFILE</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className={`badge ${profile?.approved ? "badge-green" : "badge-amber"}`}>{profile?.approved ? "Approved" : "Pending Approval"}</span>
          <span className="badge badge-indigo">{profile?.membership_plan?.replace(/_/g, " ")}</span>
          <span className={`badge ${profile?.payment_status === "paid" ? "badge-green" : "badge-amber"}`}>{profile?.payment_status}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Photo + Punch In */}
        <div className="card-base p-6 flex flex-col items-center gap-4">
          <div className="relative">
            {profile?.profile_photo ? (
              <img src={`http://localhost:8000${profile.profile_photo}`} alt="Profile"
                className="w-28 h-28 rounded-2xl object-cover border-2 border-amber-500/30" />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-muted flex items-center justify-center text-5xl font-black text-amber-400 border-2 border-border" style={D}>
                {session?.name?.[0] ?? "U"}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-amber-400 transition-colors">
              <Camera className="w-4 h-4 text-black" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="text-center">
            <div className="font-black text-lg" style={D}>{session?.name}</div>
            <div className="text-xs text-muted-foreground">{session?.email}</div>
          </div>

          {/* Today's Punch */}
          {todayPunch && (
            <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <div className="flex justify-center items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase mb-1">
                <CheckCircle2 className="w-4 h-4" /> Attendance Marked
              </div>
              <div className="text-[11px] text-muted-foreground font-medium">
                Punched in at <strong className="text-foreground">{todayPunch.time || todayPunch.check_in_time}</strong> <br/>
                Slot: {todayPunch.slot_label || "No slot"}
              </div>
            </div>
          )}

          {/* QR Code Button */}
          {profile?.approved ? (
            <div className="w-full space-y-3 mt-1">
              {!showQR ? (
                <button onClick={() => setShowQR(true)}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                    color: "#050509",
                    boxShadow: "0 0 32px rgba(245,158,11,0.25)",
                  }}
                >
                  <QrCode className="w-5 h-5" />
                  SHOW GYM PASS
                </button>
              ) : (
                <motion.div
                  className="flex flex-col items-center gap-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* QR Code display */}
                  {profile?.qr_code && (
                    <div className="relative">
                      <div className="p-3 bg-white rounded-xl shadow-lg" style={{ boxShadow: "0 0 40px rgba(245,158,11,0.2)" }}>
                        <img src={`http://localhost:8000${profile.qr_code}`} alt="QR Code" className="w-28 h-28" />
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
                    Scan at the terminal to punch in
                  </div>

                  <button onClick={() => setShowQR(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-1">
                    Hide QR Code
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2.5 rounded-xl border border-border">
              <QrCode className="w-4 h-4" /> QR available after approval
            </div>
          )}
        </div>

        {/* Personal details */}
        <div className="card-base p-6 lg:col-span-2">
          <h3 className="section-title mb-4 flex items-center gap-2"><User className="w-5 h-5 text-amber-400" /> Personal Details</h3>
          <InfoRow label="Age"              value={profile?.age ? `${profile.age} years` : null} />
          <InfoRow label="Gender"           value={profile?.gender} />
          <InfoRow label="Height"           value={profile?.height_cm ? `${profile.height_cm} cm` : null} />
          <InfoRow label="Weight"           value={profile?.weight_kg ? `${profile.weight_kg} kg` : null} />
          <InfoRow label="BMI"              value={
            <div className="flex items-center gap-2">
              <span>{bmi}</span>
              <span className={`badge ${cat.color}`}>{cat.label}</span>
            </div>
          } />
          <InfoRow label="Membership"       value={profile?.membership_plan?.replace(/_/g, " ")} />
          <InfoRow label="Valid Until"      value={profile?.membership_validity} />
          <InfoRow label="Assigned Trainer" value={profile?.trainer_name || "Not assigned"} />
          <InfoRow label="Calorie Target"   value={profile?.calorie_target ? `${profile.calorie_target} kcal/day` : null} />
          <InfoRow label="Water Goal"       value={profile?.water_intake ? `${profile.water_intake} glasses/day` : null} />
        </div>

        {/* Slot booking */}
        <div className="card-base p-6 lg:col-span-3">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="section-title">Timeslot Booking</h3>
            {profile?.slot_label && <span className="badge badge-amber ml-auto">Current: {profile.slot_label}</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {slots.map((s: any) => {
              const count = s.occupancy ?? 0;
              const max = s.max_capacity ?? 5;
              const isFull = count >= max;
              const isActive = profile?.selected_slot === s.id || profile?.selected_slot?.id === s.id;
              return (
                <button key={s.id} onClick={() => !isFull && handleBookSlot(s.id)} disabled={isFull}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isActive  ? "border-amber-500 bg-amber-500/8 shadow-[0_0_16px_rgba(245,158,11,0.15)]" :
                    isFull    ? "border-border bg-muted/30 opacity-50 cursor-not-allowed" :
                                "border-border bg-muted/30 hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer"
                  }`}>
                  <div className="font-semibold text-sm mb-1">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</div>
                  <div className={`text-xs font-bold mt-2 ${isFull ? "text-rose-400" : isActive ? "text-amber-400" : "text-emerald-400"}`}>
                    {isFull ? "Full" : isActive ? "✓ Your slot" : `${max - count} left`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
