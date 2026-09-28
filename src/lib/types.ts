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
  name?: string | null;
  phone?: string | null;
  learning_goal?: string | null;
  goal?: string | null;
  created_at?: string | null;
}

export interface UserProfileUpdatePayload {
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  learning_goal?: string;
  goal?: string;
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

export interface GoalMilestone {
  id: string;
  goal_id?: string;
  title: string;
  is_completed: boolean;
  done?: boolean;
}

export interface Goal {
  id: string;
  user_id?: string;
  title: string;
  category?: string;
  description?: string;
  target_date?: string | null;
  deadline?: string | null;
  status?: string;
  milestones?: GoalMilestone[];
  steps?: { id: string; title: string; done: boolean }[];
}

export interface GoalCreatePayload {
  title: string;
  category?: string;
  target_date?: string;
  milestones?: string[];
}

export interface PlannerEvent {
  id: string;
  user_id?: string;
  day_of_week?: string;
  day?: string;
  title?: string;
  activity?: string;
  start_time?: string;
  start?: string;
  end_time?: string;
  minutes?: number;
  subject_id?: string | null;
  subjectId?: string | null;
}

export interface PlannerEventCreatePayload {
  day_of_week: string;
  title: string;
  start_time: string;
  end_time: string;
  subject_id?: string | null;
}

export interface PlannerEventUpdatePayload {
  day_of_week?: string;
  title?: string;
  start_time?: string;
  end_time?: string;
  subject_id?: string | null;
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
