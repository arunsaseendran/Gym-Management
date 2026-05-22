import { useEffect, useState } from "react";
import { Utensils, Droplets, AlertCircle, Calendar } from "lucide-react";
import { api } from "../../../store/api";

const D = { fontFamily: "'Barlow Condensed', system-ui, sans-serif" };

const DIET_PLANS: Record<string, { breakfast: string; lunch: string; dinner: string; snack: string; water: string; tip: string }> = {
  Underweight: {
    breakfast: "Oatmeal with banana + whole milk + mixed nuts + boiled eggs",
    lunch: "Rice + dal + chicken curry + vegetable salad + curd",
    dinner: "Chapati (4) + paneer butter masala + dal + curd",
    snack: "Peanut butter toast + banana smoothie + dates",
    water: "2.5 litres daily",
    tip: "Eat calorie-dense foods every 3 hours. Focus on protein and healthy fats. Aim for 500+ calorie surplus daily.",
  },
  Normal: {
    breakfast: "Whole wheat toast + 3 eggs (scrambled) + fresh fruit + green tea",
    lunch: "Brown rice + lentil soup + grilled chicken/fish + salad",
    dinner: "Chapati (2) + mixed vegetable curry + grilled tofu + soup",
    snack: "Greek yogurt + berries + a handful of almonds",
    water: "3 litres daily",
    tip: "Maintain your balance! Include protein in every meal. Stay active 4–5 days/week with mixed cardio and strength training.",
  },
  Overweight: {
    breakfast: "Greek yogurt (unsweetened) + berries + chia seeds + green tea",
    lunch: "Grilled chicken salad + quinoa + lemon dressing + cucumber",
    dinner: "Vegetable soup + 2 chapati + stir-fried vegetables + lean meat",
    snack: "Apple + 10 almonds or carrot sticks with hummus",
    water: "3.5 litres daily",
    tip: "Reduce refined carbs and sugar. Eat high-protein, high-fibre meals. Calorie deficit of 300–500/day recommended.",
  },
  Obese: {
    breakfast: "Boiled eggs (2) + cucumber + tomato + black coffee or green tea",
    lunch: "Grilled chicken breast + large green salad + lemon olive oil dressing",
    dinner: "Stir-fried vegetables + tofu or fish + clear soup",
    snack: "Cucumber slices + green tea or herbal tea",
    water: "4 litres daily",
    tip: "Consult a nutritionist. Strict calorie control (1200–1500 kcal/day). Avoid sugar, fried foods, and processed items completely.",
  },
};

export default function MemberDiet() {
  const [profile, setProfile] = useState<any>(null);
  const [assignedDiet, setAssignedDiet] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.members.getMe().catch(() => null),
      api.workouts.listDiets().catch(() => []),
    ])
    .then(([p, diets]) => {
      setProfile(p);
      if (diets && diets.length > 0) {
        setAssignedDiet(diets[0]);
      }
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  const bmi = profile?.bmi ?? 0;
  const bmiLabel = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const bmiColor = bmi < 18.5 ? "badge-sky" : bmi < 25 ? "badge-green" : bmi < 30 ? "badge-amber" : "badge-red";
  const fallbackPlan = DIET_PLANS[bmiLabel];

  if (!profile) {
    return (
      <div className="max-w-3xl space-y-6">
        <div><div className="page-header-label mb-1">Member · Diet</div><h1 className="text-4xl font-black" style={D}>DIET PLAN</h1></div>
        <div className="card-base p-10 flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <span>Could not load your profile. Please ensure you are registered and approved.</span>
        </div>
      </div>
    );
  }

  // Use assigned diet if available, else fall back to BMI plan
  const planName = assignedDiet ? assignedDiet.name : "PERSONALISED DIET PLAN";
  const isCustom = !!assignedDiet;
  const breakfast = assignedDiet?.breakfast || fallbackPlan.breakfast;
  const lunch = assignedDiet?.lunch || fallbackPlan.lunch;
  const dinner = assignedDiet?.dinner || fallbackPlan.dinner;
  const snack = assignedDiet?.snack || fallbackPlan.snack;
  const waterTarget = assignedDiet?.water_intake || fallbackPlan.water;
  const tip = assignedDiet?.notes || fallbackPlan.tip;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="page-header-label mb-1">Member · Diet</div>
        <h1 className="text-4xl font-black uppercase" style={D}>{planName}</h1>
        {isCustom ? (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Assigned by Trainer: <strong className="text-foreground">{assignedDiet.trainer_name}</strong> · Updated {new Date(assignedDiet.updated_at).toLocaleDateString()}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">Based on your current BMI and fitness goals.</p>
        )}
      </div>

      {/* Header card */}
      <div className="card-base p-5 flex flex-wrap items-center gap-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Your BMI</div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black text-amber-400" style={D}>{bmi}</span>
            <span className={`badge ${bmiColor} text-sm py-1.5 px-3`}>{bmiLabel}</span>
          </div>
        </div>
        <div className="w-px h-10 bg-border hidden sm:block" />
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Current Weight</div>
          <div className="text-2xl font-black" style={D}>{profile.weight_kg} <span className="text-base text-muted-foreground">kg</span></div>
        </div>
        <div className="w-px h-10 bg-border hidden sm:block" />
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Target Weight</div>
          <div className="text-2xl font-black text-amber-400" style={D}>{profile.target_weight_kg} <span className="text-base text-muted-foreground">kg</span></div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sky-400">
          <Droplets className="w-5 h-5" />
          <span className="text-sm font-bold capitalize">{waterTarget}</span>
        </div>
      </div>

      {/* Meals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { meal: "🌅 Breakfast", content: breakfast, colors: "border-amber-500/20 bg-amber-500/3" },
          { meal: "☀️ Lunch",     content: lunch,     colors: "border-indigo-500/20 bg-indigo-500/3" },
          { meal: "🌙 Dinner",    content: dinner,    colors: "border-emerald-500/20 bg-emerald-500/3" },
          { meal: "🍎 Snacks",    content: snack,     colors: "border-rose-500/20 bg-rose-500/3" },
        ].map(({ meal, content, colors }, idx) => (
          <div key={idx} className={`card-base p-5 border ${colors}`}>
            <div className="text-sm font-bold mb-3">{meal}</div>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{content || "No details provided."}</p>
          </div>
        ))}
      </div>

      {/* Nutrition tip / Trainer advice */}
      <div className="card-base p-5 border-amber-500/20 bg-amber-500/3">
        <div className="flex items-start gap-3">
          <Utensils className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
              {isCustom ? "Trainer's Dietary Guidelines" : "Nutrition Expert Tip"}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{tip || "Follow a well-balanced dietary routine."}</p>
          </div>
        </div>
      </div>

      {/* Water reminder */}
      <div className="card-base p-5 border-sky-500/20 bg-sky-500/3">
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 text-sky-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">Daily Water Intake</div>
            <p className="text-sm text-foreground/80">
              Drink <strong className="text-sky-400">{waterTarget}</strong> of water throughout the day. Your trainer recommends this for optimal recovery. 
              {profile?.water_intake && ` Your dashboard tracking target is set to ${profile.water_intake} glasses.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
