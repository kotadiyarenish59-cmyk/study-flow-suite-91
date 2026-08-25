import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  seedGoals,
  seedNotes,
  seedPlanner,
  seedSessions,
  seedSubjects,
  seedTasks,
} from "./mock-data";
import type { Goal, Note, PlannerEvent, StudySession, Subject, Task, User } from "./types";

const KEY = "studyflow-state-v1";

interface State {
  user: User | null;
  subjects: Subject[];
  tasks: Task[];
  notes: Note[];
  goals: Goal[];
  planner: PlannerEvent[];
  sessions: StudySession[];
}

const initialState: State = {
  user: null,
  subjects: seedSubjects,
  tasks: seedTasks,
  notes: seedNotes,
  goals: seedGoals,
  planner: seedPlanner,
  sessions: seedSessions,
};

interface StoreValue extends State {
  ready: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
  setSubjects: (fn: (prev: Subject[]) => Subject[]) => void;
  setTasks: (fn: (prev: Task[]) => Task[]) => void;
  setNotes: (fn: (prev: Note[]) => Note[]) => void;
  setGoals: (fn: (prev: Goal[]) => Goal[]) => void;
  setPlanner: (fn: (prev: PlannerEvent[]) => PlannerEvent[]) => void;
  addSession: (minutes: number) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export const uid = () => Math.random().toString(36).slice(2, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      ready,
      signIn: (user) => setState((s) => ({ ...s, user })),
      signOut: () => setState((s) => ({ ...s, user: null })),
      setSubjects: (fn) => setState((s) => ({ ...s, subjects: fn(s.subjects) })),
      setTasks: (fn) => setState((s) => ({ ...s, tasks: fn(s.tasks) })),
      setNotes: (fn) => setState((s) => ({ ...s, notes: fn(s.notes) })),
      setGoals: (fn) => setState((s) => ({ ...s, goals: fn(s.goals) })),
      setPlanner: (fn) => setState((s) => ({ ...s, planner: fn(s.planner) })),
      addSession: (minutes) =>
        setState((s) => ({
          ...s,
          sessions: [
            ...s.sessions,
            { id: uid(), date: new Date().toISOString().slice(0, 10), minutes },
          ],
        })),
    }),
    [state, ready],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function subjectProgress(subject: Subject) {
  if (!subject.topics.length) return 0;
  const done = subject.topics.filter((t) => t.done).length;
  return Math.round((done / subject.topics.length) * 100);
}
