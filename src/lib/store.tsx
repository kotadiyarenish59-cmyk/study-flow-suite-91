import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getStoredToken, removeStoredToken, setStoredToken, getStoredUser, setStoredUser, removeStoredUser } from "./api";
import type {
  Goal,
  GoalCreatePayload,
  Note,
  PlannerEvent,
  PlannerEventCreatePayload,
  PlannerEventUpdatePayload,
  Priority,
  StudySession,
  Subject,
  SubjectResponse,
  Task,
  TaskResponse,
  User,
  UserLoginPayload,
  UserProfile,
  UserProfileUpdatePayload,
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
    name: profile.full_name || profile.name || (profile.email ? profile.email.split("@")[0] : "Student"),
    email: profile.email,
    phone: profile.phone ?? "",
    goal: profile.learning_goal ?? profile.goal ?? "",
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
  updateProfile: (payload: UserProfileUpdatePayload) => Promise<User>;
  addSubject: (name: string) => Promise<Subject>;
  deleteSubject: (id: string) => Promise<void>;
  addTask: (payload: { title: string; subject_id: string; due_date?: string; priority?: Priority }) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addGoal: (payload: GoalCreatePayload) => Promise<Goal>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  addPlannerEvent: (payload: PlannerEventCreatePayload) => Promise<PlannerEvent>;
  updatePlannerEvent: (id: string, payload: PlannerEventUpdatePayload) => Promise<PlannerEvent>;
  deletePlannerEvent: (id: string) => Promise<void>;
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

      const [rawSubjects, rawTasks, rawGoals, rawPlanner] = await Promise.all([
        api.subjects.list().catch(() => []),
        api.tasks.list().catch(() => []),
        api.goals.list().catch(() => []),
        api.planner.list().catch(() => []),
      ]);

      const subjects = rawSubjects.map(mapBackendSubject);
      const tasks = rawTasks.map(mapBackendTask);
      const goals = rawGoals.map((g) => ({
        ...g,
        deadline: g.target_date || "",
        steps: (g.milestones || []).map((m) => ({ id: m.id, title: m.title, done: m.is_completed })),
      }));
      const planner = rawPlanner.map((p) => ({
        ...p,
        day: p.day_of_week || "",
        activity: p.title || "",
        start: p.start_time || "",
        subjectId: p.subject_id || undefined,
      }));

      setState((s) => ({
        ...s,
        user,
        subjects,
        tasks,
        goals: goals.length > 0 ? goals : s.goals,
        planner: planner.length > 0 ? planner : s.planner,
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
          goals: [],
          planner: [],
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

      const [rawSubjects, rawTasks, rawGoals, rawPlanner] = await Promise.all([
        api.subjects.list().catch(() => []),
        api.tasks.list().catch(() => []),
        api.goals.list().catch(() => []),
        api.planner.list().catch(() => []),
      ]);

      const subjects = rawSubjects.map(mapBackendSubject);
      const tasks = rawTasks.map(mapBackendTask);
      const goals = rawGoals.map((g) => ({
        ...g,
        deadline: g.target_date || "",
        steps: (g.milestones || []).map((m) => ({ id: m.id, title: m.title, done: m.is_completed })),
      }));
      const planner = rawPlanner.map((p) => ({
        ...p,
        day: p.day_of_week || "",
        activity: p.title || "",
        start: p.start_time || "",
        subjectId: p.subject_id || undefined,
      }));

      setState((s) => ({
        ...s,
        user,
        subjects,
        tasks,
        goals,
        planner,
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
        goals: [],
        planner: [],
        loading: false,
      }));
      return user;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      throw err;
    }
  };

  const updateProfileAction = async (payload: UserProfileUpdatePayload): Promise<User> => {
    try {
      const res = await api.auth.updateProfile(payload);
      const updatedUser = mapBackendUser(res);
      setStoredUser(updatedUser);
      setState((s) => ({ ...s, user: updatedUser }));
      return updatedUser;
    } catch (err: any) {
      if (state.user) {
        const fallbackUser: User = {
          ...state.user,
          name: payload.name ?? payload.full_name ?? state.user.name,
          email: payload.email ?? state.user.email,
          phone: payload.phone ?? state.user.phone,
          goal: payload.learning_goal ?? payload.goal ?? state.user.goal,
        };
        setStoredUser(fallbackUser);
        setState((s) => ({ ...s, user: fallbackUser }));
      }
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
      goals: [],
      planner: [],
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

  const addGoalAction = async (payload: GoalCreatePayload): Promise<Goal> => {
    try {
      const res = await api.goals.create(payload);
      const newGoal: Goal = {
        ...res,
        deadline: res.target_date || "",
        steps: (res.milestones || []).map((m) => ({ id: m.id, title: m.title, done: m.is_completed })),
      };
      setState((s) => ({ ...s, goals: [newGoal, ...s.goals] }));
      return newGoal;
    } catch (err) {
      const localGoal: Goal = {
        id: uid(),
        title: payload.title,
        category: payload.category || "general",
        target_date: payload.target_date || null,
        deadline: payload.target_date || "",
        status: "pending",
        milestones: (payload.milestones || []).map((m) => ({
          id: uid(),
          title: m,
          is_completed: false,
          done: false,
        })),
        steps: (payload.milestones || []).map((m) => ({
          id: uid(),
          title: m,
          done: false,
        })),
      };
      setState((s) => ({ ...s, goals: [localGoal, ...s.goals] }));
      return localGoal;
    }
  };

  const toggleMilestoneAction = async (goalId: string, milestoneId: string): Promise<void> => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => {
        if (g.id !== goalId) return g;
        const currentMilestones = g.milestones || [];
        const currentSteps = g.steps || [];
        const updatedMilestones = currentMilestones.map((m) =>
          m.id === milestoneId ? { ...m, is_completed: !m.is_completed, done: !m.is_completed } : m
        );
        const updatedSteps = currentSteps.map((m) =>
          m.id === milestoneId ? { ...m, done: !m.done } : m
        );
        return {
          ...g,
          milestones: updatedMilestones,
          steps: updatedSteps,
        };
      }),
    }));
    try {
      await api.goals.toggleMilestone(goalId, milestoneId);
    } catch {
      /* fallback saved locally */
    }
  };

  const deleteGoalAction = async (goalId: string): Promise<void> => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== goalId) }));
    try {
      await api.goals.delete(goalId);
    } catch {
      /* fallback deleted locally */
    }
  };

  const addPlannerEventAction = async (payload: PlannerEventCreatePayload): Promise<PlannerEvent> => {
    try {
      const res = await api.planner.create(payload);
      const newEvent: PlannerEvent = {
        ...res,
        day: res.day_of_week || payload.day_of_week,
        activity: res.title || payload.title,
        start: res.start_time || payload.start_time,
        subjectId: res.subject_id || payload.subject_id || undefined,
      };
      setState((s) => ({ ...s, planner: [...s.planner, newEvent] }));
      return newEvent;
    } catch (err) {
      const localEvent: PlannerEvent = {
        id: uid(),
        day: payload.day_of_week,
        day_of_week: payload.day_of_week,
        title: payload.title,
        activity: payload.title,
        start: payload.start_time,
        start_time: payload.start_time,
        end_time: payload.end_time,
        subject_id: payload.subject_id || undefined,
        subjectId: payload.subject_id || undefined,
      };
      setState((s) => ({ ...s, planner: [...s.planner, localEvent] }));
      return localEvent;
    }
  };

  const updatePlannerEventAction = async (id: string, payload: PlannerEventUpdatePayload): Promise<PlannerEvent> => {
    try {
      const res = await api.planner.update(id, payload);
      const updatedEvent: PlannerEvent = {
        ...res,
        day: res.day_of_week || payload.day_of_week || "",
        activity: res.title || payload.title || "",
        start: res.start_time || payload.start_time || "",
        subjectId: res.subject_id || payload.subject_id || undefined,
      };
      setState((s) => ({
        ...s,
        planner: s.planner.map((e) => (e.id === id ? { ...e, ...updatedEvent } : e)),
      }));
      return updatedEvent;
    } catch (err) {
      setState((s) => ({
        ...s,
        planner: s.planner.map((e) =>
          e.id === id
            ? {
                ...e,
                ...payload,
                day: payload.day_of_week ?? e.day ?? e.day_of_week,
                activity: payload.title ?? e.activity ?? e.title,
                start: payload.start_time ?? e.start ?? e.start_time,
                subjectId: payload.subject_id ?? e.subjectId ?? e.subject_id,
              }
            : e
        ),
      }));
      throw err;
    }
  };

  const deletePlannerEventAction = async (id: string): Promise<void> => {
    setState((s) => ({ ...s, planner: s.planner.filter((e) => e.id !== id) }));
    try {
      await api.planner.delete(id);
    } catch {
      /* fallback deleted locally */
    }
  };

  const refreshDataAction = async (): Promise<void> => {
    if (!state.user) return;
    try {
      const [rawSubjects, rawTasks, rawGoals, rawPlanner] = await Promise.all([
        api.subjects.list().catch(() => []),
        api.tasks.list().catch(() => []),
        api.goals.list().catch(() => []),
        api.planner.list().catch(() => []),
      ]);
      const goals = rawGoals.map((g) => ({
        ...g,
        deadline: g.target_date || "",
        steps: (g.milestones || []).map((m) => ({ id: m.id, title: m.title, done: m.is_completed })),
      }));
      const planner = rawPlanner.map((p) => ({
        ...p,
        day: p.day_of_week || "",
        activity: p.title || "",
        start: p.start_time || "",
        subjectId: p.subject_id || undefined,
      }));
      setState((s) => ({
        ...s,
        subjects: rawSubjects.map(mapBackendSubject),
        tasks: rawTasks.map(mapBackendTask),
        goals: goals.length > 0 ? goals : s.goals,
        planner: planner.length > 0 ? planner : s.planner,
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
      updateProfile: updateProfileAction,
      addSubject: addSubjectAction,
      deleteSubject: deleteSubjectAction,
      addTask: addTaskAction,
      toggleTask: toggleTaskAction,
      deleteTask: deleteTaskAction,
      addGoal: addGoalAction,
      toggleMilestone: toggleMilestoneAction,
      deleteGoal: deleteGoalAction,
      addPlannerEvent: addPlannerEventAction,
      updatePlannerEvent: updatePlannerEventAction,
      deletePlannerEvent: deletePlannerEventAction,
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
