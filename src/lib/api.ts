import type {
  Goal,
  GoalCreatePayload,
  GoalMilestone,
  PlannerEvent,
  PlannerEventCreatePayload,
  PlannerEventUpdatePayload,
  SubjectCreatePayload,
  SubjectResponse,
  TaskCreatePayload,
  TaskResponse,
  TaskUpdatePayload,
  TokenData,
  UserLoginPayload,
  UserProfile,
  UserProfileUpdatePayload,
  UserSignupPayload,
} from "./types";


const API_BASE_URL = (import.meta.env as Record<string, string>)["VITE_API_URL"] || "http://127.0.0.1:8000/api/v1";
const TOKEN_KEY = "studyflow_access_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeStoredToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

const USER_KEY = "studyflow_user_data";

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function removeStoredUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  detail: any;

  constructor(status: number, message: string, detail?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = false,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (requireAuth) {
    throw new ApiError(401, "Authentication token missing. Please log in.");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail: any = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        if (typeof errorJson.detail === "string") {
          errorDetail = errorJson.detail;
        } else if (Array.isArray(errorJson.detail)) {
          errorDetail = errorJson.detail.map((err: any) => err.msg || JSON.stringify(err)).join(", ");
        } else {
          errorDetail = JSON.stringify(errorJson.detail);
        }
      }
    } catch {
      errorDetail = await response.text();
    }
    throw new ApiError(response.status, errorDetail || `HTTP ${response.status}`, errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  auth: {
    signup: (payload: UserSignupPayload): Promise<TokenData> =>
      apiFetch<TokenData>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    login: (payload: UserLoginPayload): Promise<TokenData> =>
      apiFetch<TokenData>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    getMe: (): Promise<UserProfile> =>
      apiFetch<UserProfile>("/auth/me", { method: "GET" }, true),

    updateProfile: (payload: UserProfileUpdatePayload): Promise<UserProfile> =>
      apiFetch<UserProfile>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      }, true),
  },

  subjects: {
    list: (): Promise<SubjectResponse[]> =>
      apiFetch<SubjectResponse[]>("/subjects", { method: "GET" }, true),

    create: (payload: SubjectCreatePayload): Promise<SubjectResponse> =>
      apiFetch<SubjectResponse>("/subjects", {
        method: "POST",
        body: JSON.stringify(payload),
      }, true),

    delete: (subjectId: string): Promise<void> =>
      apiFetch<void>(`/subjects/${subjectId}`, { method: "DELETE" }, true),
  },

  tasks: {
    list: (params?: { subject_id?: string; status?: string }): Promise<TaskResponse[]> => {
      const query = new URLSearchParams();
      if (params?.subject_id) query.append("subject_id", params.subject_id);
      if (params?.status) query.append("status", params.status);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return apiFetch<TaskResponse[]>(`/tasks${queryString}`, { method: "GET" }, true);
    },

    create: (payload: TaskCreatePayload): Promise<TaskResponse> =>
      apiFetch<TaskResponse>("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      }, true),

    update: (taskId: string, payload: TaskUpdatePayload): Promise<TaskResponse> =>
      apiFetch<TaskResponse>(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }, true),

    delete: (taskId: string): Promise<void> =>
      apiFetch<void>(`/tasks/${taskId}`, { method: "DELETE" }, true),
  },

  goals: {
    list: (): Promise<Goal[]> =>
      apiFetch<Goal[]>("/goals", { method: "GET" }, true),

    create: (payload: GoalCreatePayload): Promise<Goal> =>
      apiFetch<Goal>("/goals", {
        method: "POST",
        body: JSON.stringify(payload),
      }, true),

    toggleMilestone: (goalId: string, milestoneId: string): Promise<GoalMilestone> =>
      apiFetch<GoalMilestone>(`/goals/${goalId}/milestones/${milestoneId}`, {
        method: "PATCH",
      }, true),

    delete: (goalId: string): Promise<void> =>
      apiFetch<void>(`/goals/${goalId}`, { method: "DELETE" }, true),
  },

  planner: {
    list: (): Promise<PlannerEvent[]> =>
      apiFetch<PlannerEvent[]>("/planner", { method: "GET" }, true),

    create: (payload: PlannerEventCreatePayload): Promise<PlannerEvent> =>
      apiFetch<PlannerEvent>("/planner", {
        method: "POST",
        body: JSON.stringify(payload),
      }, true),

    update: (eventId: string, payload: PlannerEventUpdatePayload): Promise<PlannerEvent> =>
      apiFetch<PlannerEvent>(`/planner/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }, true),

    delete: (eventId: string): Promise<void> =>
      apiFetch<void>(`/planner/${eventId}`, { method: "DELETE" }, true),
  },
};
