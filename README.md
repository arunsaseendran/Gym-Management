# 🏋️ SmartGYM — Smart Gym Management System

> A full-stack, intelligent gym management platform featuring role-based dashboards, AI-powered calorie prediction, QR code attendance, and Razorpay-integrated online payments.

🌐 **Live Application URL**: [https://gym-management-three-mauve.vercel.app/](https://gym-management-three-mauve.vercel.app/)

---

## 📌 What This Project Aims to Do

**SmartGYM** is a comprehensive digital solution designed to eliminate manual gym administration overhead. It aims to:

- **Streamline member onboarding** — online registration, plan selection, and payment processing in one flow.
- **Automate attendance** — via unique QR codes generated per member, scannable by trainers or admins.
- **Empower trainers** — with a dedicated portal to manage trainees, prescribe workout plans, dietary routines, and post coaching advice.
- **Leverage AI for fitness tracking** — a Scikit-Learn ML model automatically predicts calories burned per workout session using member biometrics.
- **Give admins full control** — a unified analytics dashboard surfacing real-time metrics, member approvals, slot scheduling, and renewal reminder dispatch.
- **Scale to production** — built with a decoupled architecture, JWT authentication, PostgreSQL-ready backend, and a Vite-bundled React frontend.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4 |
| **UI Components** | Radix UI primitives, MUI, shadcn/ui, Recharts |
| **Routing** | React Router v7 |
| **Animations** | Motion (Framer Motion) |
| **Backend** | Django 6, Django REST Framework |
| **Authentication** | JWT via `djangorestframework-simplejwt` |
| **Database** | SQLite (dev) / PostgreSQL (production) |
| **ML Engine** | Scikit-Learn, pandas, NumPy, joblib |
| **Payments** | Razorpay (with sandbox mock fallback) |
| **QR Code** | `qrcode` + `Pillow` (server-side generation) |
| **QR Scanner** | `html5-qrcode` (browser camera capture) |
| **Email** | Django SMTP / Brevo |

---

## 🚀 System Architecture

SmartGYM uses a **decoupled frontend–backend architecture**:

```
┌──────────────────────────────┐
│      React SPA Frontend      │
│   (Vite, TSX, React Router)  │
└──────────────┬───────────────┘
               │ HTTP REST / JWT Bearer Token
               ▼
┌──────────────────────────────┐
│      Django DRF Backend      │
│  (JWT Auth, Serializers, API)│
└──────────┬───┬───────────┬───┘
           │   │           │
    ┌──────┘   │           └──────────────┐
    ▼          ▼                          ▼
┌──────────┐ ┌────────────────────┐ ┌──────────────────┐
│  SQLite  │ │ Scikit-Learn Model │ │ Razorpay Checkout│
│ Database │ │ (joblib, pandas)   │ │ (Payment Gateway)│
└──────────┘ └────────────────────┘ └──────────────────┘
```

---

## 👥 User Roles & How It Works

SmartGYM has **three user roles**, each with a dedicated workflow:

### 🔑 Admin
1. Registers trainers and manages their profiles.
2. Reviews pending member registrations and **approves accounts** — triggering QR code generation.
3. Creates **time slots** with configurable capacity limits.
4. Monitors gym-wide **analytics**: active members, check-ins today, revenue, calorie trends.
5. Dispatches **membership renewal reminder emails** via SMTP.

### 🏃 Trainer
1. Logs in to view all **assigned trainees**.
2. Creates **structured workout plans** (day-by-day exercise schedules stored as JSON).
3. Prescribes **diet plans** (breakfast, lunch, dinner, snacks, water targets).
4. Posts **coaching advice** directly to a trainee's profile.
5. **Manually marks attendance** (present / absent / late).

### 🧍 Member
1. **Registers online**, chooses a subscription plan, and completes payment via Razorpay.
2. After admin approval, accesses the dashboard and their **unique QR code**.
3. **Books a gym time slot** (enforced capacity checks prevent overbooking).
4. **Logs daily workouts** — the ML engine automatically predicts calories burned.
5. Views their **assigned trainer's workout and diet prescriptions**.
6. Tracks daily **water intake** from the dashboard.
7. Presents the QR code at the gym entrance for attendance check-in.

---

## 🤖 AI Calorie Prediction Engine

The ML pipeline integrates seamlessly into the workout logging flow:

```
User logs: [Exercise Type, Duration, Intensity]
              ↓
Biometric fetch: [Age, Gender, Height, Weight] ← from MemberProfile
              ↓
Auto-estimate: [Heart Rate, Body Temperature] ← derived from intensity level
              ↓
Scikit-Learn Pipeline (loaded via joblib) → Calorie Prediction
              ↓
Result saved to WorkoutLog.calories_burned
```

**Intensity Mappings:**
| Intensity | Heart Rate | Body Temp |
|---|---|---|
| High | 145 bpm | 38.3 °C |
| Medium | 125 bpm | 37.6 °C |
| Low | 95 bpm | 36.8 °C |

---

## 💳 Razorpay Payment Flow

1. Member selects a plan → Frontend calls `/api/payments/create-order/`.
2. Backend initializes an order with Razorpay and returns an `order_id`.
3. Frontend opens the **Razorpay Checkout Modal**.
4. After payment, Razorpay returns `order_id`, `payment_id`, and a `signature`.
5. Frontend submits all three to `/api/payments/verify-payment/`.
6. Backend validates the **HMAC-SHA256 signature** — if valid, marks payment as `paid` and activates the member.

> **Sandbox Mode**: If Razorpay credentials are absent, the system falls back to a mock order (`order_mock_<uuid>`) to allow end-to-end testing without live keys.

---

## 📁 Project Structure

```
Gym Management/
├── backend/                  # Django REST Framework API
│   ├── accounts/             # Custom User model (admin, trainer, member roles)
│   ├── members/              # Member profiles, QR generation, slot booking
│   ├── trainers/             # Trainer profiles, trainee management, advice
│   ├── attendance/           # QR scan & manual attendance endpoints
│   ├── workouts/             # Workout logs, workout plans, diet plans
│   ├── payments/             # Razorpay order creation & verification
│   ├── predictor/            # ML calorie prediction endpoint & history
│   ├── reports/              # Dashboard stats, weekly check-ins, calorie trends
│   ├── slots/                # Gym time slot management
│   ├── ml_models/            # Serialized Scikit-Learn model (.joblib)
│   ├── gymcore/              # Django project settings & URL routing
│   ├── requirements.txt      # Python dependencies
│   └── manage.py
│
├── frontend/                 # React + TypeScript SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/        # Landing, Login, Portal pages
│   │   │   └── App.tsx       # Root routing (role-based route guards)
│   │   ├── components/       # Reusable UI components
│   │   └── services/         # Axios API service layer
│   ├── package.json
│   └── vite.config.ts
│
└── PROJECT_WORKFLOW_AND_ARCHITECTURE.md   # Detailed technical reference
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ / pnpm
- (Optional) PostgreSQL for production

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables (copy and edit)
cp .env.example .env
# Fill in: SECRET_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, EMAIL credentials

# Run database migrations
python manage.py migrate

# (Optional) Seed initial demo data
python manage.py seed_data

# Start the development server
python manage.py runserver
```

The backend API will be available at: **`http://localhost:8000`**

---

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies using pnpm
pnpm install

# Start the Vite dev server
pnpm dev
```

The frontend will be available at: **`http://localhost:5173`**

---

### 3. Environment Variables (Backend `.env`)

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for development, `False` for production |
| `DATABASE_URL` | PostgreSQL connection string (production) |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret |
| `EMAIL_HOST` | SMTP host (e.g. `smtp-relay.brevo.com`) |
| `EMAIL_PORT` | SMTP port (e.g. `587`) |
| `EMAIL_HOST_USER` | SMTP login username |
| `EMAIL_HOST_PASSWORD` | SMTP login password |

---

## 🔌 API Overview

| Route | Method | Description | Auth |
|---|---|---|---|
| `/api/auth/login/` | `POST` | Login & receive JWT tokens | Public |
| `/api/auth/register/` | `POST` | Member / Trainer registration | Public |
| `/api/auth/me/` | `GET` | Authenticated user's profile | JWT |
| `/api/members/` | `GET` | List all member profiles | Admin |
| `/api/members/<id>/approve/` | `PATCH` | Approve member & generate QR | Admin |
| `/api/members/<id>/book-slot/` | `PATCH` | Reserve a gym time slot | Member |
| `/api/trainers/my-trainees/` | `GET` | Trainer's assigned members | Trainer |
| `/api/attendance/qr/` | `POST` | Process QR code check-in | Trainer/Admin |
| `/api/attendance/manual/` | `POST` | Manual attendance entry | Trainer/Admin |
| `/api/workouts/` | `GET/POST` | Log workouts (triggers ML) | Member |
| `/api/workouts/plans/` | `GET/POST` | Workout plan management | Trainer/Member |
| `/api/workouts/diets/` | `GET/POST` | Diet plan management | Trainer/Member |
| `/api/payments/create-order/` | `POST` | Initialize Razorpay order | Public |
| `/api/payments/verify-payment/` | `POST` | Verify payment signature | Public |
| `/api/predictor/predict/` | `POST` | Direct ML calorie prediction | JWT |
| `/api/predictor/history/` | `GET` | Past prediction records | JWT |
| `/api/reports/stats/` | `GET` | Gym-wide dashboard analytics | JWT |
| `/api/reports/weekly-checkins/` | `GET` | 7-day attendance timeline | JWT |
| `/api/reports/calorie-trends/` | `GET` | Calorie progression graph | JWT |
| `/api/slots/` | `GET/POST` | Manage gym time slots | Admin |

---

## 🗺️ Frontend Route Map

| Route | Component | Accessible By |
|---|---|---|
| `/` | `Landing.tsx` | Everyone |
| `/login` | `Login.tsx` | Everyone |
| `/portal/overview` | `Overview.tsx` | All logged-in roles |
| `/portal/members` | Members management | Admin |
| `/portal/trainers` | Trainer management | Admin |
| `/portal/slots` | Slot scheduling | Admin |
| `/portal/trainees` | Trainee plans & advice | Trainer |
| `/portal/attendance` | Attendance roster | Trainer/Admin |
| `/portal/profile` | Member profile & QR | Member |
| `/portal/workouts` | Workout logger + AI burn | Member |
| `/portal/diet` | Assigned diet plans | Member |
| `/portal/scanner` | QR camera scanner | Trainer/Admin |
| `/portal/predictor` | Standalone ML predictor | All logged-in roles |
| `/portal/reports` | Charts & analytics | All logged-in roles |

---

## 📖 Further Reading

For a complete technical deep-dive including full DFDs, ER diagrams, and step-by-step data flow analysis, refer to:

📄 **[PROJECT_WORKFLOW_AND_ARCHITECTURE.md](./PROJECT_WORKFLOW_AND_ARCHITECTURE.md)**

---

## 📄 License

This project is intended for academic and portfolio use. All rights reserved © SmartGYM.
