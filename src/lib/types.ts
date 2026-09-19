export type Priority = "low" | "medium" | "high";
export type BackendTaskStatus = "todo" | "in_progress" | "completed";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  goal?: string | null;
  createdAt?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  created_at?: string | null;
}

export interface UserSignupPayload {
  email: string;
  password: string;
  full_name?: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface TokenData {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface Topic {
  id: string;
  title: string;
  done: boolean;
}

export interface SubjectResponse {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface SubjectCreatePayload {
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  topics: Topic[];
  user_id?: string | null;
  created_at?: string | null;
}

export interface TaskResponse {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  status: BackendTaskStatus;
  due_date?: string | null;
  created_at: string;
}

export interface TaskCreatePayload {
  title: string;
  subject_id: string;
  status?: BackendTaskStatus;
  due_date?: string | null;
}

export interface TaskUpdatePayload {
  title?: string;
  status?: BackendTaskStatus;
  due_date?: string | null;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  subject_id?: string;
  priority: Priority;
  dueDate: string;
  due_date?: string | null;
  minutes: number;
  completed: boolean;
  status: BackendTaskStatus;
  user_id?: string | null;
  created_at?: string | null;
  focus?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  pinned: boolean;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  steps: { id: string; title: string; done: boolean }[];
}

export interface PlannerEvent {
  id: string;
  day: string;
  subjectId?: string;
  activity: string;
  start: string;
  minutes: number;
}

export interface StudySession {
  id: string;
  date: string;
  minutes: number;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface RoadmapStep {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming";
}
