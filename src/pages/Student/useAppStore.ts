// src/store/useAppStore.ts
import { create } from "zustand";

// ===== Types =====
export type User = {
  id: string;
  name: string;
  className: string;
  section: string;
  avatarUrl?: string | null;
  schoolLogoUrl?: string | null;
};

export type ClassItem = {
  id: string;
  dateISO: string;
  icon: string;
  title: string;
  topic: string;
  summary: string;
  progress: number;
};

export type Exam = {
  id: string;
  subject: string;
  topic: string;
  dateISO: string;
};

export type TranscriptTurn = {
  id: string;
  role: "child" | "coach";
  text: string;
  ts: number;
  nudge?: string;
};

export type HobbyPlanDay = {
  day: number;
  title: string;
  tasks: string[];
  unlocked: boolean;
  done: boolean;
};

export type Grievance = {
  id: string;
  createdAt: number;
  text: string;
  notifyTeacherId: string;
  notifyParentId: string;
  status: "open" | "acknowledged" | "resolved";
};

export type Assignment = {
  id: string;
  dateISO: string;
  title: string;
  subject: string;
  type: "mcq" | "quiz";
  numQuestions: number;
  completed: boolean;
};

// ===== State shape =====
type State = {
  // User (needed by Header.tsx)
  user: User;
  setUser: (u: Partial<User>) => void;

  // Home page / general
  aiTip: string;
  upcomingExams: Exam[];
  _classes: ClassItem[];
  getClassesFor: (dateISO: string) => ClassItem[];

  // Personality: Communication
  communication: {
    transcripts: TranscriptTurn[];
    addTurn: (t: Omit<TranscriptTurn, "id" | "ts">) => void;
    addCoachNudge: (text: string) => void;
    reset: () => void;
  };

  // Personality: Hobby
  hobby: {
    selected: string | null;
    plans: Record<string, HobbyPlanDay[]>;
    select: (name: string) => void;
    markDone: (hobby: string, day: number) => void;
  };

  // Personality: Grievance
  grievances: {
    all: Grievance[];
    submit: (text: string) => void;
  };

  // Assignments
  _assignments: Assignment[];
  getAssignmentsFor: (dateISO: string) => Assignment[];
  toggleAssignment: (id: string, completed: boolean) => void;
};

// ===== Helpers =====
const todayISO = new Date().toISOString().slice(0, 10);
const plusISO = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
};

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// ===== Store =====
export const useAppStore = create<State>((set, get) => ({
  // ------- User -------
  user: {
    id: "student-1",
    name: "Aarav Kumar",
    className: "Grade 6",
    section: "B",
    avatarUrl: null,
    schoolLogoUrl: null,
  },
  setUser: u => set(s => ({ user: { ...s.user, ...u } })),

  // ------- General (Home) -------
  aiTip: "Tip: Speak in complete sentences. Try: “I visited my grandparents on Sunday because…”",
  upcomingExams: [
    { id: "e1", subject: "Math", topic: "Fractions", dateISO: plusISO(5) },
    { id: "e2", subject: "Science", topic: "Plants", dateISO: plusISO(12) },
  ],
  _classes: [
    {
      id: "c1",
      dateISO: todayISO,
      icon: "🌱",
      title: "Biology",
      topic: "Photosynthesis",
      summary: "How leaves turn light into energy.",
      progress: 0.72,
    },
    {
      id: "c2",
      dateISO: todayISO,
      icon: "➗",
      title: "Math",
      topic: "Fractions",
      summary: "Parts of a whole & simple operations.",
      progress: 0.4,
    },
    {
      id: "c3",
      dateISO: plusISO(-1),
      icon: "📜",
      title: "History",
      topic: "Harappan Civilization",
      summary: "Trade, seals and city planning.",
      progress: 0.9,
    },
  ],
  getClassesFor: (dateISO: string) => get()._classes.filter(c => c.dateISO === dateISO),

  // ------- Personality: Communication -------
  communication: {
    transcripts: [],
    addTurn: t =>
      set(s => ({
        communication: {
          ...s.communication,
          transcripts: [...s.communication.transcripts, { id: makeId(), ts: Date.now(), ...t }],
        },
      })),
    addCoachNudge: (text: string) =>
      set(s => ({
        communication: {
          ...s.communication,
          transcripts: [
            ...s.communication.transcripts,
            {
              id: makeId(),
              ts: Date.now(),
              role: "coach",
              text,
              nudge: "Try to add reasons (“because…”) and one follow-up question.",
            },
          ],
        },
      })),
    reset: () =>
      set(s => ({
        communication: { ...s.communication, transcripts: [] },
      })),
  },

  // ------- Personality: Hobby -------
  hobby: {
    selected: null,
    plans: {
      Painting: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        title: `Painting Day ${i + 1}`,
        tasks:
          i === 0
            ? ["Gather supplies", "Primary color mixing"]
            : ["Practice 20 mins", "Reflect 2 lines"],
        unlocked: i === 0,
        done: false,
      })),
      Guitar: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        title: `Guitar Day ${i + 1}`,
        tasks:
          i === 0
            ? ["Tune strings", "Learn 2 basic chords"]
            : ["Strum pattern 5 mins", "Chord switch practice"],
        unlocked: i === 0,
        done: false,
      })),
    },
    select: (name: string) => set(s => ({ hobby: { ...s.hobby, selected: name } })),
    markDone: (hobby: string, day: number) =>
      set(s => {
        const copy = s.hobby.plans[hobby]?.map(d => ({ ...d }));
        if (!copy) return s;
        const idx = copy.findIndex(d => d.day === day);
        if (idx === -1) return s;
        copy[idx].done = true;
        if (idx + 1 < copy.length) copy[idx + 1].unlocked = true;
        return { hobby: { ...s.hobby, plans: { ...s.hobby.plans, [hobby]: copy } } };
      }),
  },

  // ------- Personality: Grievance -------
  grievances: {
    all: [],
    submit: (text: string) =>
      set(s => ({
        grievances: {
          ...s.grievances,
          all: [
            ...s.grievances.all,
            {
              id: makeId(),
              createdAt: Date.now(),
              text,
              notifyTeacherId: "teacher-1",
              notifyParentId: "parent-1",
              status: "open",
            },
          ],
        },
      })),
  },

  // ------- Assignments -------
  _assignments: [
    {
      id: "a1",
      dateISO: todayISO,
      title: "Fractions – MCQ Set 1",
      subject: "Math",
      type: "mcq",
      numQuestions: 10,
      completed: false,
    },
    {
      id: "a2",
      dateISO: todayISO,
      title: "Leaf Parts – Quiz",
      subject: "Science",
      type: "quiz",
      numQuestions: 8,
      completed: false,
    },
    {
      id: "a3",
      dateISO: plusISO(-1),
      title: "Indus Valley – MCQ",
      subject: "History",
      type: "mcq",
      numQuestions: 12,
      completed: true,
    },
  ],
  getAssignmentsFor: (dateISO: string) => get()._assignments.filter(a => a.dateISO === dateISO),
  toggleAssignment: (id: string, completed: boolean) =>
    set(s => ({
      _assignments: s._assignments.map(a => (a.id === id ? { ...a, completed } : a)),
    })),
}));
