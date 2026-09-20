import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getStoredToken, removeStoredToken, setStoredToken, getStoredUser, setStoredUser, removeStoredUser } from "./api";
import type {
  Goal,
  Note,
  PlannerEvent,
  Priority,
  StudySession,
  Subject,
  SubjectResponse,
  Task,
  TaskResponse,
  User,
  UserLoginPayload,
  UserProfile,
  UserSignupPayload,
} from "./types";

interface State {
  user: User | null;
  subjects: Subject[];
  tasks: Task[];
  notes: Note[];
  goals: Goal[];
  planner: PlannerEvent[];
  sessions: StudySession[];
  ready: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  user: null,
  subjects: [],
  tasks: [],
  notes: [],
  goals: [],
  planner: [],
  sessions: [],
  ready: false,
  loading: false,
  error: null,
};

function mapBackendUser(profile: UserProfile): User {
  return {
    id: profile.id,
    name: profile.full_name || profile.email.split("@")[0] || "Student",
    email: profile.email,
    createdAt: profile.created_at || null,
  };
}

function mapBackendSubject(res: SubjectResponse): Subject {
  return {
    id: res.id,
    name: res.name,
    color: "hsl(var(--primary))",
    topics: [],
    user_id: res.user_id,
    created_at: res.created_at,
  };
}

function mapBackendTask(res: TaskResponse): Task {
  const dueDateStr = res.due_date ? res.due_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    id: res.id,
    title: res.title,
    subjectId: res.subject_id,
    subject_id: res.subject_id,
    priority: "medium",
    dueDate: dueDateStr,
    due_date: res.due_date || null,
    minutes: 30,
    completed: res.status === "completed",
    status: res.status,
    user_id: res.user_id,
    created_at: res.created_at,
  };
}

interface StoreValue extends State {
  signIn: (user: User) => void;
  signOut: () => void;
  login: (payload: UserLoginPayload) => Promise<User>;
  signup: (payload: UserSignupPayload) => Promise<User>;
  addSubject: (name: string) => Promise<Subject>;
  deleteSubject: (id: string) => Promise<void>;
  addTask: (payload: { title: string; subject_id: string; due_date?: string; priority?: Priority }) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
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
  const [state, setState] = useState<State>(() => {
    const storedUser = getStoredUser();
    const token = getStoredToken();
    if (token && storedUser) {
      return {
        ...initialState,
        user: storedUser,
        ready: true,
      };
    }
    return initialState;
  });

  async function loadInitialData() {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (!token) {
      removeStoredUser();
      setState((s) => ({ ...s, user: null, ready: true }));
      return;
    }

    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const me = await api.auth.getMe();
      const user = mapBackendUser(me);
      setStoredUser(user);

      const [rawSubjects, rawTasks] = await Promise.all([
        api.subjects.list().catch(() => []),
        api.tasks.list().catch(() => []),
      ]);

      const subjects = rawSubjects.map(mapBackendSubject);
      const tasks = rawTasks.map(mapBackendTask);

      setState((s) => ({
        ...s,
        user,
        subjects,
        tasks,
        ready: true,
        loading: false,
      }));
    } catch (err: any) {
      if (err?.status === 401) {
        removeStoredToken();
        removeStoredUser();
        setState((s) => ({
          ...s,
          user: null,
          subjects: [],
          tasks: [],
          ready: true,
          loading: false,
        }));
      } else {
        // Keep stored user if temporary network issue or server restart
        setState((s) => ({
          ...s,
          user: s.user || storedUser,
          ready: true,
          loading: false,
        }));
      }
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  const loginAction = async (payload: UserLoginPayload): Promise<User> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.auth.login(payload);
      setStoredToken(res.access_token);
      const user = mapBackendUser(res.user);
      setStoredUser(user);

      const [rawSubjects, rawTasks] = await Promise.all([
        api.subjects.list().catch(() => []),
        api.tasks.list().catch(() => []),
      ]);

      const subjects = rawSubjects.map(mapBackendSubject);
      const tasks = rawTasks.map(mapBackendTask);

      setState((s) => ({
        ...s,
        user,
        subjects,
        tasks,
        loading: false,
      }));
      return user;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      throw err;
    }
  };

  const signupAction = async (payload: UserSignupPayload): Promise<User> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.auth.signup(payload);
      if (res.access_token) {
        setStoredToken(res.access_token);
      }
      const user = mapBackendUser(res.user);
      setStoredUser(user);
      setState((s) => ({
        ...s,
        user,
        subjects: [],
        tasks: [],
        loading: false,
      }));
      return user;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      throw err;
    }
  };

  const signOutAction = () => {
    removeStoredToken();
    removeStoredUser();
    setState((s) => ({
      ...s,
      user: null,
      subjects: [],
      tasks: [],
    }));
  };

  const addSubjectAction = async (name: string): Promise<Subject> => {
    const res = await api.subjects.create({ name });
    const newSubject = mapBackendSubject(res);
    setState((s) => ({ ...s, subjects: [newSubject, ...s.subjects] }));
    return newSubject;
  };

  const deleteSubjectAction = async (id: string): Promise<void> => {
    await api.subjects.delete(id);
    setState((s) => ({
      ...s,
      subjects: s.subjects.filter((sub) => sub.id !== id),
      tasks: s.tasks.filter((t) => t.subjectId !== id && t.subject_id !== id),
    }));
  };

  const addTaskAction = async (payload: {
    title: string;
    subject_id: string;
    due_date?: string;
    priority?: Priority;
  }): Promise<Task> => {
    const res = await api.tasks.create({
      title: payload.title,
      subject_id: payload.subject_id,
      status: "todo",
      due_date: payload.due_date ? new Date(payload.due_date).toISOString() : null,
    });
    const newTask = mapBackendTask(res);
    if (payload.priority) {
      newTask.priority = payload.priority;
    }
    setState((s) => ({ ...s, tasks: [newTask, ...s.tasks] }));
    return newTask;
  };

  const toggleTaskAction = async (id: string): Promise<void> => {
    const current = state.tasks.find((t) => t.id === id);
    if (!current) return;
    const nextStatus = current.completed ? "todo" : "completed";
    const res = await api.tasks.update(id, { status: nextStatus });
    const updated = mapBackendTask(res);
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...updated, priority: t.priority, minutes: t.minutes } : t)),
    }));
  };

  const deleteTaskAction = async (id: string): Promise<void> => {
    await api.tasks.delete(id);
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  };

  const refreshDataAction = async (): Promise<void> => {
    if (!state.user) return;
    try {
      const [rawSubjects, rawTasks] = await Promise.all([
        api.subjects.list(),
        api.tasks.list(),
      ]);
      setState((s) => ({
        ...s,
        subjects: rawSubjects.map(mapBackendSubject),
        tasks: rawTasks.map(mapBackendTask),
      }));
    } catch {
      /* ignore background refresh errors */
    }
  };

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      signIn: (user) => setState((s) => ({ ...s, user })),
      signOut: signOutAction,
      login: loginAction,
      signup: signupAction,
      addSubject: addSubjectAction,
      deleteSubject: deleteSubjectAction,
      addTask: addTaskAction,
      toggleTask: toggleTaskAction,
      deleteTask: deleteTaskAction,
      refreshData: refreshDataAction,
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
    [state],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function subjectProgress(subject: Subject) {
  if (!subject.topics || !subject.topics.length) return 0;
  const done = subject.topics.filter((t) => t.done).length;
  return Math.round((done / subject.topics.length) * 100);
}
