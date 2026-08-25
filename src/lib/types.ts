export type Priority = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  goal?: string;
}

export interface Topic {
  id: string;
  title: string;
  done: boolean;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  topics: Topic[];
}

export interface Task {
  id: string;
  title: string;
  subjectId?: string;
  priority: Priority;
  dueDate: string;
  minutes: number;
  completed: boolean;
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
