// ─── API Client for Django Backend ──────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface UserSession {
  token: string;
  role: "admin" | "trainer" | "member";
  name: string;
  email: string;
  id: number;
}

export const api = {
  // Token state helpers
  getToken: () => localStorage.getItem("sg_token"),
  setSession: (session: UserSession) => {
    localStorage.setItem("sg_token", session.token);
    localStorage.setItem("sg_role", session.role);
    localStorage.setItem("sg_name", session.name);
    localStorage.setItem("sg_email", session.email);
    localStorage.setItem("sg_user_id", String(session.id));
  },
  clearSession: () => {
    localStorage.removeItem("sg_token");
    localStorage.removeItem("sg_role");
    localStorage.removeItem("sg_name");
    localStorage.removeItem("sg_email");
    localStorage.removeItem("sg_user_id");
  },
  getSession: (): UserSession | null => {
    const token = localStorage.getItem("sg_token");
    const role = localStorage.getItem("sg_role") as any;
    const name = localStorage.getItem("sg_name");
    const email = localStorage.getItem("sg_email");
    const id = localStorage.getItem("sg_user_id");
    if (!token || !role || !name || !email || !id) return null;
    return { token, role, name, email, id: parseInt(id) };
  },

  // Base fetch handler with automatic auth headers
  request: async (endpoint: string, options: RequestInit = {}) => {
    const token = api.getToken();
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && endpoint !== "/auth/login/") {
      api.clearSession();
      window.dispatchEvent(new Event("sg_unauthorized"));
      throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (Array.isArray(errData)) {
        throw new Error(errData.join(", "));
      }
      if (errData && typeof errData === "object" && !errData.error && !errData.detail) {
        const messages = Object.entries(errData)
          .map(([key, value]) => {
            const field = key === "non_field_errors" ? "Error" : key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ");
            const detail = Array.isArray(value) ? value.join(", ") : String(value);
            return `${field}: ${detail}`;
          })
          .join(" | ");
        if (messages) {
          throw new Error(messages);
        }
      }
      throw new Error(errData.error || errData.detail || "Request failed");
    }

    // Handle empty or blank responses gracefully
    if (response.status === 204) return null;
    return response.json();
  },

  // Auth APIs
  auth: {
    login: async (username: string, password: string): Promise<UserSession> => {
      const data = await api.request("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const session: UserSession = {
        token: data.access,
        role: data.role,
        name: data.name,
        email: data.email,
        id: data.id,
      };
      api.setSession(session);
      return session;
    },
    register: async (payload: any) => {
      return api.request("/auth/register/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    changePassword: async (old_password: string, new_password: string) => {
      return api.request("/auth/change-password/", {
        method: "POST",
        body: JSON.stringify({ old_password, new_password }),
      });
    },
    listUsers: async () => {
      return api.request("/auth/users/");
    },
    checkAvailability: async (payload: { username?: string, email?: string }) => {
      return api.request("/auth/check-availability/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
  },

  // Member APIs
  members: {
    list: async () => {
      return api.request("/members/");
    },
    getMe: async () => {
      return api.request("/members/me/");
    },
    getDetail: async (id: number) => {
      return api.request(`/members/${id}/`);
    },
    update: async (id: number, payload: any) => {
      return api.request(`/members/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    approve: async (id: number) => {
      return api.request(`/members/${id}/approve/`, {
        method: "PATCH",
      });
    },
    bookSlot: async (memberId: number, slotId: number) => {
      return api.request(`/members/${memberId}/book-slot/`, {
        method: "PATCH",
        body: JSON.stringify({ slot_id: slotId }),
      });
    },
    uploadPhoto: async (memberId: number, file: File) => {
      const fd = new FormData();
      fd.append("photo", file);
      return api.request(`/members/${memberId}/upload-photo/`, {
        method: "PATCH",
        body: fd,
      });
    },
    updateWater: async (memberId: number, waterIntake: number) => {
      return api.request(`/members/${memberId}/water/`, {
        method: "PATCH",
        body: JSON.stringify({ water_intake: waterIntake }),
      });
    },
    delete: async (id: number) => {
      return api.request(`/members/${id}/`, {
        method: "DELETE",
      });
    }
  },

  // Trainer APIs
  trainers: {
    list: async () => {
      return api.request("/trainers/");
    },
    getTrainees: async () => {
      return api.request("/trainers/my-trainees/");
    },
    sendAdvice: async (memberId: number, text: string) => {
      return api.request("/trainers/advice/", {
        method: "POST",
        body: JSON.stringify({ member: memberId, text }),
      });
    },
    update: async (id: number, payload: any) => {
      return api.request(`/trainers/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    delete: async (id: number) => {
      return api.request(`/trainers/${id}/`, {
        method: "DELETE",
      });
    }
  },

  // Timeslot APIs
  slots: {
    list: async () => {
      return api.request("/slots/");
    }
  },

  // Attendance APIs
  attendance: {
    list: async (date?: string) => {
      const query = date ? `?date=${date}` : "";
      return api.request(`/attendance/${query}`);
    },
    qrCheckin: async (userId: number) => {
      return api.request("/attendance/qr/", {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      });
    },
    manualMark: async (memberId: number, status: string) => {
      return api.request("/attendance/manual/", {
        method: "POST",
        body: JSON.stringify({ member_id: memberId, status }),
      });
    }
  },

  // Workout APIs
  workouts: {
    list: async (memberId?: number) => {
      const query = memberId ? `?member=${memberId}` : "";
      return api.request(`/workouts/${query}`);
    },
    log: async (payload: { exercise_type: string; duration_min: number; intensity: string; member?: number }) => {
      return api.request("/workouts/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    advice: async () => {
      return api.request("/workouts/advice/");
    },
    listPlans: async (memberId?: number) => {
      const query = memberId ? `?member=${memberId}` : "";
      return api.request(`/workouts/plans/${query}`);
    },
    createPlan: async (payload: { member: number; name: string; difficulty: string; notes?: string; routines: any }) => {
      return api.request("/workouts/plans/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updatePlan: async (id: number, payload: any) => {
      return api.request(`/workouts/plans/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    deletePlan: async (id: number) => {
      return api.request(`/workouts/plans/${id}/`, {
        method: "DELETE",
      });
    },
    listDiets: async (memberId?: number) => {
      const query = memberId ? `?member=${memberId}` : "";
      return api.request(`/workouts/diets/${query}`);
    },
    createDiet: async (payload: { member: number; name: string; breakfast: string; lunch: string; dinner: string; snack: string; water_intake: string; notes?: string }) => {
      return api.request("/workouts/diets/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateDiet: async (id: number, payload: any) => {
      return api.request(`/workouts/diets/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    deleteDiet: async (id: number) => {
      return api.request(`/workouts/diets/${id}/`, {
        method: "DELETE",
      });
    }
  },

  // ML Predictor APIs
  predictor: {
    predict: async (payload: {
      duration: number;
      heart_rate: number;
      body_temp: number;
      age?: number;
      gender?: string;
      height?: number;
      weight?: number;
    }) => {
      return api.request("/predictor/predict/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    history: async () => {
      return api.request("/predictor/history/");
    }
  },

  // Reports & Analytics APIs
  reports: {
    dashboard: async () => {
      return api.request("/reports/dashboard/");
    },
    weeklyCheckins: async () => {
      return api.request("/reports/weekly-checkins/");
    },
    calorieTrends: async (memberId?: number) => {
      const query = memberId ? `?member=${memberId}` : "";
      return api.request(`/reports/calorie-trends/${query}`);
    },
    slotOccupancy: async () => {
      return api.request("/reports/slot-occupancy/");
    }
  },

  // Payments / Razorpay APIs
  payments: {
    planPrices: async () => {
      return api.request("/payments/plan-prices/");
    },
    createOrder: async (payload: { plan: string; name: string; email: string }) => {
      return api.request("/payments/create-order/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    verifyPayment: async (payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      return api.request("/payments/verify/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
  }
};
