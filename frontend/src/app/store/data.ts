// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface Member {
  id: string; name: string; email: string; password: string;
  age: number; gender: string; height: number; weight: number;
  targetWeight: number; calorieTarget: number;
  membershipPlan: string; membershipValidity: string;
  status: string; approved: boolean; paymentStatus: string;
  assignedTrainer: string; selectedSlot: string;
  waterIntake: number; profilePhoto: string;
}

export interface Trainer {
  id: string; name: string; email: string;
  specialization: string; schedule: string; availability: string;
}

export interface Slot {
  id: string; time: string; maxCapacity: number;
}

export interface AttendanceRecord {
  id: string; memberId: string; memberName: string;
  date: string; time: string; status: string; slotId: string;
}

export interface WorkoutLog {
  id: string; memberId: string; date: string;
  exerciseType: string; duration: number; intensity: string; caloriesBurned: number;
}

export interface MLRecord {
  id: string; memberId: string; date: string;
  age: number; gender: string; height: number; weight: number;
  duration: number; heartRate: number; bodyTemp: number; caloriesPredicted: number;
}

export interface AdviceRecord {
  id: string; memberId: string; trainerId: string; date: string; text: string;
}

export interface Notification {
  id: string; recipientType: string; recipientId: string;
  text: string; time: string; read: boolean;
}

// ─── Initial Seed Data ────────────────────────────────────────────────────────

export const INITIAL_MEMBERS: Member[] = [
  { id: "MEM-001", name: "Rahul Sharma", email: "rahul@smartgym.com", password: "pass123", age: 26, gender: "male", height: 175, weight: 74, targetWeight: 70, calorieTarget: 2400, membershipPlan: "Premium Annual", membershipValidity: "2027-05-15", status: "Active", approved: true, paymentStatus: "Paid", assignedTrainer: "TRN-201", selectedSlot: "SLT-04", waterIntake: 4, profilePhoto: "" },
  { id: "MEM-002", name: "Priya Patel", email: "priya@smartgym.com", password: "pass123", age: 29, gender: "female", height: 162, weight: 58, targetWeight: 55, calorieTarget: 2000, membershipPlan: "Standard Monthly", membershipValidity: "2026-06-20", status: "Active", approved: true, paymentStatus: "Paid", assignedTrainer: "TRN-203", selectedSlot: "SLT-01", waterIntake: 6, profilePhoto: "" },
  { id: "MEM-003", name: "Rohan Verma", email: "rohan@smartgym.com", password: "pass123", age: 32, gender: "male", height: 180, weight: 88, targetWeight: 80, calorieTarget: 2800, membershipPlan: "Elite Quarterly", membershipValidity: "2026-08-10", status: "Active", approved: false, paymentStatus: "Pending", assignedTrainer: "TRN-202", selectedSlot: "SLT-04", waterIntake: 3, profilePhoto: "" },
];

export const INITIAL_TRAINERS: Trainer[] = [
  { id: "TRN-201", name: "Rajesh Kumar", specialization: "Strength Training", email: "rajesh@smartgym.com", schedule: "6:00 AM – 12:00 PM", availability: "Available" },
  { id: "TRN-202", name: "Vikram Singh", specialization: "Yoga & Flexibility", email: "vikram@smartgym.com", schedule: "4:00 PM – 9:00 PM", availability: "Available" },
  { id: "TRN-203", name: "Sarah D'Souza", specialization: "Cardio & HIIT", email: "sarah@smartgym.com", schedule: "6:00 AM – 10:00 AM & 5:00 PM – 8:00 PM", availability: "Available" },
];

export const INITIAL_SLOTS: Slot[] = [
  { id: "SLT-01", time: "06:00 AM – 07:00 AM", maxCapacity: 5 },
  { id: "SLT-02", time: "07:00 AM – 08:00 AM", maxCapacity: 5 },
  { id: "SLT-03", time: "08:00 AM – 09:00 AM", maxCapacity: 5 },
  { id: "SLT-04", time: "06:00 PM – 07:00 PM", maxCapacity: 5 },
  { id: "SLT-05", time: "07:00 PM – 08:00 PM", maxCapacity: 5 },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: "ATT-101", memberId: "MEM-001", memberName: "Rahul Sharma", date: "2026-05-20", time: "06:12 PM", status: "Present", slotId: "SLT-04" },
  { id: "ATT-102", memberId: "MEM-002", memberName: "Priya Patel", date: "2026-05-20", time: "06:05 AM", status: "Present", slotId: "SLT-01" },
  { id: "ATT-103", memberId: "MEM-001", memberName: "Rahul Sharma", date: "2026-05-21", time: "06:22 PM", status: "Late Entry", slotId: "SLT-04" },
  { id: "ATT-104", memberId: "MEM-002", memberName: "Priya Patel", date: "2026-05-21", time: "06:02 AM", status: "Present", slotId: "SLT-01" },
];

export const INITIAL_WORKOUTS: WorkoutLog[] = [
  { id: "WRK-301", memberId: "MEM-001", date: "2026-05-18", exerciseType: "Weight Training", duration: 45, intensity: "High", caloriesBurned: 420 },
  { id: "WRK-302", memberId: "MEM-001", date: "2026-05-19", exerciseType: "Cardio", duration: 30, intensity: "Medium", caloriesBurned: 290 },
  { id: "WRK-303", memberId: "MEM-001", date: "2026-05-20", exerciseType: "HIIT", duration: 40, intensity: "High", caloriesBurned: 480 },
  { id: "WRK-304", memberId: "MEM-002", date: "2026-05-19", exerciseType: "Yoga", duration: 50, intensity: "Low", caloriesBurned: 180 },
  { id: "WRK-305", memberId: "MEM-002", date: "2026-05-20", exerciseType: "Cardio", duration: 45, intensity: "High", caloriesBurned: 410 },
  { id: "WRK-306", memberId: "MEM-002", date: "2026-05-21", exerciseType: "Pilates", duration: 35, intensity: "Medium", caloriesBurned: 240 },
];

export const INITIAL_ML_HISTORY: MLRecord[] = [
  { id: "MLH-401", memberId: "MEM-001", date: "2026-05-18", age: 26, gender: "male", height: 175, weight: 74, duration: 45, heartRate: 142, bodyTemp: 38.2, caloriesPredicted: 420 },
  { id: "MLH-402", memberId: "MEM-001", date: "2026-05-19", age: 26, gender: "male", height: 175, weight: 74, duration: 30, heartRate: 125, bodyTemp: 37.6, caloriesPredicted: 290 },
  { id: "MLH-403", memberId: "MEM-001", date: "2026-05-20", age: 26, gender: "male", height: 175, weight: 74, duration: 40, heartRate: 148, bodyTemp: 38.4, caloriesPredicted: 480 },
  { id: "MLH-404", memberId: "MEM-002", date: "2026-05-19", age: 29, gender: "female", height: 162, weight: 58, duration: 50, heartRate: 110, bodyTemp: 37.1, caloriesPredicted: 180 },
  { id: "MLH-405", memberId: "MEM-002", date: "2026-05-20", age: 29, gender: "female", height: 162, weight: 58, duration: 45, heartRate: 145, bodyTemp: 38.3, caloriesPredicted: 410 },
  { id: "MLH-406", memberId: "MEM-002", date: "2026-05-21", age: 29, gender: "female", height: 162, weight: 58, duration: 35, heartRate: 128, bodyTemp: 37.8, caloriesPredicted: 240 },
];

export const INITIAL_ADVICE: AdviceRecord[] = [
  { id: "ADV-01", memberId: "MEM-001", trainerId: "TRN-201", date: "2026-05-20", text: "Focus on deep squats today. Keep your back straight and push through your heels." },
  { id: "ADV-02", memberId: "MEM-002", trainerId: "TRN-203", date: "2026-05-21", text: "Great hydration level! Increase your warm-up by 5 minutes tomorrow before cardio." },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "NTF-01", recipientType: "trainer", recipientId: "TRN-201", text: "New member assigned: Rahul Sharma", time: "2 days ago", read: false },
  { id: "NTF-02", recipientType: "admin", recipientId: "all", text: "Membership approval requested by Rohan Verma", time: "1 day ago", read: false },
  { id: "NTF-03", recipientType: "member", recipientId: "MEM-001", text: "Slot reservation confirmed: Slot 4 (06:00 PM)", time: "5 mins ago", read: false },
];

// ─── ML Calorie Linear Regression Engine (mirrors scikit-learn coefficients) ──

export function predictCaloriesML(
  age: number, gender: string, height: number, weight: number,
  duration: number, heartRate: number, bodyTemp: number
): number {
  const predicted =
    duration * 4.52 +
    (heartRate - 65) * 2.38 +
    (bodyTemp - 36.5) * 12.85 +
    weight * 0.18 +
    age * -0.11 +
    (gender === "male" ? 18.5 : -12.3) +
    -95.0;
  return Math.max(25, Math.round(predicted));
}

// ─── BMI helpers ──────────────────────────────────────────────────────────────

export function calculateBMI(weight: number, heightCm: number) {
  const h = heightCm / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

export function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { category: "Underweight", color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/30"   };
  if (bmi < 25)   return { category: "Normal Weight", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" };
  if (bmi < 30)   return { category: "Overweight",   color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/30"  };
  return              { category: "Obese",          color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/30"   };
}

export function getDietRecommendation(bmi: number) {
  if (bmi < 18.5) return {
    type: "Bulking / Weight Gain Plan",
    breakfast: "Sprouted pulses, whole wheat bread with peanut butter, banana shake.",
    lunch: "Brown rice, mixed veg curry, thick paneer gravy, bowl of curd.",
    dinner: "Soya chunks, baked potato, dynamic protein salad.",
    water: 3.5,
  };
  if (bmi >= 25) return {
    type: "Caloric Deficit / Shredding Plan",
    breakfast: "Oats with skimmed milk, egg whites or tofu scramble, green tea.",
    lunch: "2 multigrain rotis, grilled chicken or dal fry, raw cucumber salad.",
    dinner: "Boiled legumes, sautéed broccoli, buttermilk.",
    water: 4.2,
  };
  return {
    type: "Fitness Maintenance Plan",
    breakfast: "Muesli with dry fruits, apple, boiled eggs or sprouts chaat.",
    lunch: "Steamed brown rice, yellow lentils, grilled paneer/fish, leaf salad.",
    dinner: "Mixed bean soup, stir-fried mushrooms, 1 wheat chapati.",
    water: 3.8,
  };
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
}
function save<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export const db = {
  members:       { load: () => load("sg_members",       INITIAL_MEMBERS),       save: (v: Member[])           => save("sg_members", v)       },
  trainers:      { load: () => load("sg_trainers",      INITIAL_TRAINERS),      save: (v: Trainer[])          => save("sg_trainers", v)      },
  slots:         { load: () => load("sg_slots",         INITIAL_SLOTS),         save: (v: Slot[])             => save("sg_slots", v)         },
  attendance:    { load: () => load("sg_attendance",    INITIAL_ATTENDANCE),    save: (v: AttendanceRecord[]) => save("sg_attendance", v)    },
  workouts:      { load: () => load("sg_workouts",      INITIAL_WORKOUTS),      save: (v: WorkoutLog[])       => save("sg_workouts", v)      },
  mlHistory:     { load: () => load("sg_ml_history",    INITIAL_ML_HISTORY),    save: (v: MLRecord[])         => save("sg_ml_history", v)    },
  advice:        { load: () => load("sg_advice",        INITIAL_ADVICE),        save: (v: AdviceRecord[])     => save("sg_advice", v)        },
  notifications: { load: () => load("sg_notifications", INITIAL_NOTIFICATIONS), save: (v: Notification[])     => save("sg_notifications", v) },
  session: {
    getRole: (): "admin"|"trainer"|"member"  => load("sg_role", "member"),
    setRole: (r: "admin"|"trainer"|"member") => save("sg_role", r),
    getMemberId: (): string => load("sg_active_member", "MEM-001"),
    setMemberId: (id: string)  => save("sg_active_member", id),
    getTrainerId: (): string => load("sg_active_trainer", "TRN-201"),
    setTrainerId: (id: string) => save("sg_active_trainer", id),
  },
};

// ─── Beep util ────────────────────────────────────────────────────────────────
export function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    osc.start(); osc.stop(ctx.currentTime + 0.12);
  } catch {}
}
