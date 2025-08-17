// src/pages/Administration/Administration.tsx
import { useMemo, useState } from "react";
import Card from "../../components/UI/Card";

type Teacher = { id: string; name: string; subjects: string[]; classes: string[] };

// ---- demo data (replace with your store/API) ----
const TEACHERS: Teacher[] = [
  { id: "t1", name: "Ms. Kapoor", subjects: ["Math", "Physics"], classes: ["8-B", "9-A"] },
  { id: "t2", name: "Mr. Iyer", subjects: ["Biology"], classes: ["8-A", "8-B"] },
  { id: "t3", name: "Mrs. Khan", subjects: ["Chemistry"], classes: ["9-A"] },
];

const SUBJECTS = ["Math", "Physics", "Biology", "Chemistry", "English"];

const CHAPTERS: Record<string, string[]> = {
  Math: [
    "Rational Numbers",
    "Linear Equations",
    "Quadratic Equations",
    "Geometry Basics",
    "Statistics",
  ],
  Physics: ["Motion", "Forces", "Energy", "Waves", "Electricity"],
  Biology: ["Cells", "Photosynthesis", "Respiration", "Reproduction", "Genetics"],
  Chemistry: [
    "Atoms & Molecules",
    "Periodic Table",
    "Chemical Reactions",
    "Acids & Bases",
    "Metals & Non-metals",
  ],
  English: ["Reading", "Writing", "Grammar", "Poetry", "Prose"],
};

// ----- helpers -----
function startOfWeek(d: Date) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = (day + 6) % 7; // to Monday
  dt.setDate(dt.getDate() - diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function addDays(d: Date, n: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}
function fmtRange(monday: Date) {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  if (sameMonth) {
    const m = monday.toLocaleDateString(undefined, { month: "short" });
    return `${m} ${monday.getDate()}–${sunday.getDate()}, ${sunday.getFullYear()}`;
  }
  const fmt = (x: Date) => x.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
}
const clamp = (v: number) => Math.max(0, Math.min(100, v));
const colorFor = (pct: number) => `hsl(${clamp(pct) * 1.2}, 70%, ${60 - (clamp(pct) - 50) / 2}%)`; // red→green

// ----- deterministic scoring (mock, replace with backend) -----
type PrepBreakdown = {
  objectives: number;
  bloom: number;
  checks: number;
  differentiation: number;
  alignment: number;
};
type AssessBreakdown = {
  difficulty: number;
  discrimination: number;
  rubricClarity: number;
  ambiguity: number;
};
type TeacherPerf = {
  prepFidelity: number;
  prepDetail: PrepBreakdown;
  assessmentQuality: number;
  assessDetail: AssessBreakdown;
  coveragePct: number;
  masteryPct: number;
};
function seeded(name: string) {
  // deterministic pseudo-random
  let x = 2166136261;
  for (let i = 0; i < name.length; i++) {
    x ^= name.charCodeAt(i);
    x += (x << 1) + (x << 4) + (x << 7) + (x << 8) + (x << 24);
  }
  return () => {
    x = (1103515245 * x + 12345) % 2 ** 31;
    return x % 101;
  };
}
function scoreTeacher(t: Teacher, week: Date): TeacherPerf {
  const s = seeded(`${t.id}|${week.toISOString().slice(0, 10)}`);
  const prep: PrepBreakdown = {
    objectives: s(),
    bloom: s(),
    checks: s(),
    differentiation: s(),
    alignment: s(),
  };
  const assess: AssessBreakdown = {
    difficulty: s(),
    discrimination: s(),
    rubricClarity: 100 - s(),
    ambiguity: 100 - s(),
  };
  const prepF = Math.round(
    0.2 * prep.objectives +
      0.25 * prep.bloom +
      0.2 * prep.checks +
      0.2 * prep.differentiation +
      0.15 * prep.alignment
  );
  const assessQ = Math.round(
    0.3 * assess.difficulty +
      0.3 * assess.discrimination +
      0.3 * assess.rubricClarity +
      0.1 * (100 - assess.ambiguity)
  );
  const coverage = clamp(60 + (s() % 21) - 10);
  const mastery = clamp(55 + (s() % 31) - 15);
  return {
    prepFidelity: prepF,
    prepDetail: prep,
    assessmentQuality: assessQ,
    assessDetail: assess,
    coveragePct: coverage,
    masteryPct: mastery,
  };
}

// ----- small UI helpers -----
function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${clamp(value)}%`, background: colorFor(value) }}
        />
      </div>
    </div>
  );
}
function HeatCell({ pct }: { pct: number }) {
  return (
    <div
      className="h-8 w-8 rounded-md border border-white/40"
      style={{ background: colorFor(pct) }}
      title={`${pct}%`}
    />
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

// ----- Teacher view -----
function TeacherView() {
  const [monday, setMonday] = useState<Date>(() => startOfWeek(new Date()));
  const [teacherId, setTeacher] = useState<string>(TEACHERS[0].id);
  const teacher = useMemo(() => TEACHERS.find(t => t.id === teacherId)!, [teacherId]);
  const perf = useMemo(() => scoreTeacher(teacher, monday), [teacher, monday]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center">
          <label className="text-sm text-slate-600">Teacher</label>
          <select
            className="rounded-xl border border-slate-200 px-3 py-1.5 bg-white"
            value={teacherId}
            onChange={e => setTeacher(e.target.value)}
          >
            {TEACHERS.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setMonday(d => addDays(d, -7))}
            className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
          >
            ‹
          </button>
          <div className="text-sm">
            Week of <b>{fmtRange(monday)}</b>
          </div>
          <button
            onClick={() => setMonday(d => addDays(d, 7))}
            className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Preparation Fidelity">
          <div className="space-y-3">
            <StatBar label="Objectives clarity" value={perf.prepDetail.objectives} />
            <StatBar label="Bloom alignment" value={perf.prepDetail.bloom} />
            <StatBar label="Checks for understanding" value={perf.prepDetail.checks} />
            <StatBar label="Differentiation" value={perf.prepDetail.differentiation} />
            <StatBar label="Assessment alignment" value={perf.prepDetail.alignment} />
            <div className="pt-2 border-t">
              <StatBar label="Overall" value={perf.prepFidelity} />
            </div>
          </div>
        </Card>

        <Card title="Assessment Quality">
          <div className="space-y-3">
            <StatBar label="Item difficulty mix" value={perf.assessDetail.difficulty} />
            <StatBar label="Item discrimination" value={perf.assessDetail.discrimination} />
            <StatBar label="Rubric clarity" value={perf.assessDetail.rubricClarity} />
            <StatBar
              label="Ambiguity / leakage (inverse)"
              value={100 - perf.assessDetail.ambiguity}
            />
            <div className="pt-2 border-t">
              <StatBar label="Overall" value={perf.assessmentQuality} />
            </div>
          </div>
        </Card>

        <Card title="Coverage → Mastery (Aggregate)">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-sm text-slate-600">Coverage</div>
              <HeatCell pct={perf.coveragePct} />
              <div className="text-xs mt-1">{perf.coveragePct}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-600">Mastery</div>
              <HeatCell pct={perf.masteryPct} />
              <div className="text-xs mt-1">{perf.masteryPct}%</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Relationship of syllabus coverage vs class mastery (teacher-level, all classes).
          </div>
        </Card>
      </div>

      <Card title="Classes handled — Coverage → Mastery">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th className="py-2 pr-3">Class</th>
                <th className="py-2 pr-3">Subject</th>
                <th className="py-2 pr-3">Coverage</th>
                <th className="py-2 pr-3">Mastery</th>
              </tr>
            </thead>
            <tbody>
              {teacher.classes.map((cls, idx) => {
                const subj = teacher.subjects[idx % teacher.subjects.length];
                const pv = clamp(perf.coveragePct + (idx % 2 ? -8 : 7));
                const mv = clamp(perf.masteryPct + (idx % 2 ? -5 : 6));
                return (
                  <tr key={cls} className="border-t border-slate-100">
                    <td className="py-2 pr-3">{cls}</td>
                    <td className="py-2 pr-3">{subj}</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded" style={{ background: colorFor(pv) }} />
                        <span>{pv}%</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded" style={{ background: colorFor(mv) }} />
                        <span>{mv}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ----- Class & Section view -----
function ClassSectionView() {
  const [grade, setGrade] = useState<string>("8");
  const [section, setSection] = useState<string>("A");
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);

  const chapters = CHAPTERS[subject] ?? [];
  const perf = useMemo(() => {
    const key = `${grade}-${section}-${subject}`;
    const s = seeded(key);
    return chapters.map(ch => ({
      ch,
      coverage: clamp(40 + (s() % 61)),
      mastery: clamp(35 + (s() % 61)),
    }));
  }, [grade, section, subject, chapters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Class</span>
          <select
            value={grade}
            onChange={e => setGrade(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 bg-white"
          >
            {["6", "7", "8", "9", "10"].map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Section</span>
          <select
            value={section}
            onChange={e => setSection(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 bg-white"
          >
            {["A", "B", "C"].map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Subject</span>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 bg-white"
          >
            {SUBJECTS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card title={`Chapter Mastery Heatmap — ${subject} (Class ${grade}${section})`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th className="py-2 pr-3">Chapter</th>
                <th className="py-2 pr-3">Coverage</th>
                <th className="py-2 pr-3">Mastery</th>
              </tr>
            </thead>
            <tbody>
              {perf.map(row => (
                <tr key={row.ch} className="border-t border-slate-100">
                  <td className="py-2 pr-3">{row.ch}</td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ background: colorFor(row.coverage) }}
                      />
                      <span>{row.coverage}%</span>
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ background: colorFor(row.mastery) }}
                      />
                      <span>{row.mastery}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Color encodes % (red→amber→green). Spot units with low coverage + low mastery.
        </div>
      </Card>
    </div>
  );
}

// ----- Page wrapper -----
export default function Administration() {
  const [tab, setTab] = useState<"teacher" | "class">("teacher");
  return (
    <div className="mx-auto max-w-[1200px] px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl ">Administration</h1>
        <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-soft">
          <button
            onClick={() => setTab("teacher")}
            className={
              "px-3 py-2 rounded-xl text-sm font-medium " +
              (tab === "teacher"
                ? "bg-pastelBlue/20 border border-pastelBlue/40"
                : "hover:bg-slate-50")
            }
          >
            Teacher
          </button>
          <button
            onClick={() => setTab("class")}
            className={
              "px-3 py-2 rounded-xl text-sm font-medium " +
              (tab === "class"
                ? "bg-pastelBlue/20 border border-pastelBlue/40"
                : "hover:bg-slate-50")
            }
          >
            Class & Section
          </button>
        </div>
      </div>
      {tab === "teacher" ? <TeacherView /> : <ClassSectionView />}
    </div>
  );
}
