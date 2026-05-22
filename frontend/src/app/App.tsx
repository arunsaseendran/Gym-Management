import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import PortalLayout from "./layouts/PortalLayout";
import Landing      from "./pages/Landing";
import Login        from "./pages/Login";

// Shared
import Overview     from "./pages/portal/Overview";
import QRScanner    from "./pages/portal/QRScanner";
import MLPredictor  from "./pages/portal/MLPredictor";
import Reports      from "./pages/portal/Reports";

// Admin pages
import AdminMembers  from "./pages/portal/admin/Members";
import AdminTrainers from "./pages/portal/admin/Trainers";
import AdminSlots    from "./pages/portal/admin/Slots";

// Trainer pages
import TrainerTrainees   from "./pages/portal/trainer/Trainees";
import TrainerAttendance from "./pages/portal/trainer/Attendance";

// Member pages
import MemberProfile  from "./pages/portal/member/Profile";
import MemberWorkouts from "./pages/portal/member/Workouts";
import MemberDiet     from "./pages/portal/member/Diet";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />

          {/* ── Admin only ─────────────────────────────── */}
          <Route path="members"  element={<AdminMembers />} />
          <Route path="trainers" element={<AdminTrainers />} />
          <Route path="slots"    element={<AdminSlots />} />
          <Route path="scanner"  element={<QRScanner />} />
          <Route path="reports"  element={<Reports />} />

          {/* ── Trainer only ───────────────────────────── */}
          <Route path="trainees"   element={<TrainerTrainees />} />
          <Route path="attendance" element={<TrainerAttendance />} />

          {/* ── Member only ────────────────────────────── */}
          <Route path="profile"    element={<MemberProfile />} />
          <Route path="workouts"   element={<MemberWorkouts />} />
          <Route path="predictor"  element={<MLPredictor />} />
          <Route path="diet"       element={<MemberDiet />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
