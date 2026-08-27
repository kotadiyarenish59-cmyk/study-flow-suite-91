import type {
  Achievement,
  Goal,
  Note,
  PlannerEvent,
  RoadmapStep,
  StudySession,
  Subject,
  Task,
} from "./types";

const dayOffset = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const makeTopics = (prefix: string, total: number, done: number) =>
  Array.from({ length: total }, (_, i) => ({
    id: `${prefix}-t${i + 1}`,
    title: `${prefix} topic ${i + 1}`,
    done: i < done,
  }));

export const seedSubjects: Subject[] = [
  { id: "python", name: "Python", color: "chart-1", topics: makeTopics("Python", 32, 24) },
  { id: "java", name: "Java", color: "chart-2", topics: makeTopics("Java", 20, 12) },
  { id: "sql", name: "SQL", color: "chart-3", topics: makeTopics("SQL", 20, 9) },
  { id: "stats", name: "Statistics", color: "chart-4", topics: makeTopics("Statistics", 20, 6) },
  { id: "ml", name: "Machine Learning", color: "chart-5", topics: makeTopics("ML", 30, 3) },
  { id: "dsa", name: "Data Structures", color: "chart-1", topics: makeTopics("DSA", 24, 10) },
];

export const seedTasks: Task[] = [
  {
    id: "t1",
    title: "Python Functions",
    subjectId: "python",
    priority: "high",
    dueDate: dayOffset(0),
    minutes: 30,
    completed: false,
    focus: true,
  },
  {
    id: "t2",
    title: "SQL Practice",
    subjectId: "sql",
    priority: "medium",
    dueDate: dayOffset(0),
    minutes: 45,
    completed: false,
    focus: true,
  },
  {
    id: "t3",
    title: "Revise Statistics",
    subjectId: "stats",
    priority: "low",
    dueDate: dayOffset(0),
    minutes: 20,
    completed: false,
    focus: true,
  },
  {
    id: "t4",
    title: "Java OOP exercises",
    subjectId: "java",
    priority: "medium",
    dueDate: dayOffset(1),
    minutes: 60,
    completed: false,
  },
  {
    id: "t5",
    title: "Pandas dataframe drills",
    subjectId: "python",
    priority: "high",
    dueDate: dayOffset(2),
    minutes: 40,
    completed: false,
  },
  {
    id: "t6",
    title: "Linear regression notes",
    subjectId: "ml",
    priority: "low",
    dueDate: dayOffset(-1),
    minutes: 35,
    completed: true,
  },
  {
    id: "t7",
    title: "Array problems set 3",
    subjectId: "dsa",
    priority: "medium",
    dueDate: dayOffset(-2),
    minutes: 50,
    completed: true,
  },
  {
    id: "t8",
    title: "Joins & subqueries",
    subjectId: "sql",
    priority: "high",
    dueDate: dayOffset(-3),
    minutes: 45,
    completed: true,
  },
];

export const seedNotes: Note[] = [
  {
    id: "n1",
    title: "Python comprehensions",
    content:
      "List comprehension: [expr for item in iterable if condition].\nDict comprehension works the same with key: value.\nKeep them one level deep for readability.",
    subjectId: "python",
    pinned: true,
    updatedAt: dayOffset(0),
  },
  {
    id: "n2",
    title: "SQL join cheatsheet",
    content:
      "INNER JOIN — matching rows only.\nLEFT JOIN — all left rows.\nWindow functions: ROW_NUMBER() OVER (PARTITION BY ...).",
    subjectId: "sql",
    pinned: true,
    updatedAt: dayOffset(-1),
  },
  {
    id: "n3",
    title: "Central limit theorem",
    content:
      "Sample means approach a normal distribution as n grows, regardless of the population distribution.",
    subjectId: "stats",
    pinned: false,
    updatedAt: dayOffset(-3),
  },
  {
    id: "n4",
    title: "Gradient descent intuition",
    content: "Step opposite the gradient. Learning rate too high → divergence, too low → slow.",
    subjectId: "ml",
    pinned: false,
    updatedAt: dayOffset(-5),
  },
];

export const seedGoals: Goal[] = [
  {
    id: "g1",
    title: "Become a Data Scientist",
    description: "End-to-end data skills with a portfolio of real projects.",
    deadline: dayOffset(180),
    steps: [
      { id: "g1s1", title: "Python", done: true },
      { id: "g1s2", title: "SQL", done: true },
      { id: "g1s3", title: "Statistics", done: false },
      { id: "g1s4", title: "Pandas", done: false },
      { id: "g1s5", title: "Machine Learning", done: false },
      { id: "g1s6", title: "Projects", done: false },
    ],
  },
  {
    id: "g2",
    title: "Crack DSA interviews",
    description: "150 curated problems across all core patterns.",
    deadline: dayOffset(90),
    steps: [
      { id: "g2s1", title: "Arrays & strings", done: true },
      { id: "g2s2", title: "Hashing", done: true },
      { id: "g2s3", title: "Trees", done: false },
      { id: "g2s4", title: "Graphs", done: false },
    ],
  },
];

export const seedPlanner: PlannerEvent[] = [
  { id: "p1", day: "Monday", subjectId: "python", activity: "Functions deep dive", start: "09:00", minutes: 60 },
  { id: "p2", day: "Monday", subjectId: "sql", activity: "Query practice", start: "18:00", minutes: 45 },
  { id: "p3", day: "Tuesday", subjectId: "stats", activity: "Probability", start: "10:00", minutes: 45 },
  { id: "p4", day: "Wednesday", subjectId: "java", activity: "OOP exercises", start: "17:30", minutes: 60 },
  { id: "p5", day: "Thursday", subjectId: "ml", activity: "Regression basics", start: "20:00", minutes: 50 },
  { id: "p6", day: "Saturday", subjectId: "dsa", activity: "Contest practice", start: "11:00", minutes: 90 },
];

export const seedSessions: StudySession[] = Array.from({ length: 7 }, (_, i) => ({
  id: `s${i}`,
  date: dayOffset(i - 6),
  minutes: [45, 30, 75, 20, 60, 15, 50][i] ?? 30,
}));

export const achievements: Achievement[] = [
  { id: "a1", icon: "🏆", title: "First Week", description: "Studied 7 days in a row", unlocked: true },
  { id: "a2", icon: "🔥", title: "7 Day Streak", description: "Kept the streak alive", unlocked: true },
  { id: "a3", icon: "📚", title: "100 Topics", description: "Complete 100 topics", unlocked: false },
  { id: "a4", icon: "🎯", title: "Goal Completed", description: "Finish a learning goal", unlocked: false },
  { id: "a5", icon: "💯", title: "Perfect Week", description: "All planned sessions done", unlocked: false },
];

export const roadmap: RoadmapStep[] = [
  { id: "r1", title: "Python", status: "completed" },
  { id: "r2", title: "NumPy", status: "completed" },
  { id: "r3", title: "Pandas", status: "current" },
  { id: "r4", title: "SQL", status: "upcoming" },
  { id: "r5", title: "Statistics", status: "upcoming" },
  { id: "r6", title: "Machine Learning", status: "upcoming" },
  { id: "r7", title: "Projects", status: "upcoming" },
];

export const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
