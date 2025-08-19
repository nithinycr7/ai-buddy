// src/pages/Teacher/Dashboard.tsx
import { useMemo, useState } from "react";
import Card from "../../components/UI/Card";
import { useAppStore } from "../../store/useAppStore";

/* ---------------- Types ---------------- */
type LessonPlanInput = {
  subject: string;
  className: string;
  section: string;
  topic: string;
  topicOther?: string;
};

type LecturePlan = {
  meta: {
    subject: string;
    className: string;
    section?: string;
    topic: string;
    durationMins: number;
  };
  objectives: string[];
  hook: string;
  activities: Array<{ title: string; minutes?: number; materials?: string }>;
  differentiation: string[];
  checksForUnderstanding: string[];
  materials: string[];
  timing: Array<{ block: string; minutes: number }>;
};

/* ------------- LEFT: Planner + Notes ------------- */
export function Left() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [dateISO, setDateISO] = useState<string>(todayISO);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const {
    // timetable
    getTimetableForDate,
    timetable,
    // meta
    subjects = [],
    classesList = [],
    sections = [],
    topicsBySubject,
    // notes
    getTeachingNotes,
    // write
    upsertLessonPlan,
    // 🔑 UI state in store for cross-column comms
    setRightTab,
    setLecturePlan,
  } = useAppStore((s: any) => ({
    getTimetableForDate: s.getTimetableForDate,
    timetable: s.timetable,
    subjects: s.subjects,
    classesList: s.classesList,
    sections: s.sections,
    topicsBySubject: s.topicsBySubject,
    getTeachingNotes: s.getTeachingNotes,
    upsertLessonPlan: s.upsertLessonPlan,
    setRightTab: s.setRightTab ?? (() => {}),
    setLecturePlan: s.setLecturePlan ?? (() => {}),
  }));

  const rows = useMemo(() => {
    if (typeof getTimetableForDate === "function")
      return getTimetableForDate(dateISO) || [];
    if (timetable && timetable[dateISO]) return timetable[dateISO];
    return [];
  }, [dateISO, getTimetableForDate, timetable]);

  const selected = selectedRow != null ? rows[selectedRow] : null;

  const [inputs, setInputs] = useState<LessonPlanInput>({
    subject: "",
    className: "",
    section: "",
    topic: "",
    topicOther: "",
  });

  function pickRow(i: number) {
    setSelectedRow(i);
    const r = rows[i];
    if (!r) return;
    setInputs((prev) => ({
      ...prev,
      subject: r.subject || prev.subject,
      className: r.className || prev.className,
      section: r.section || prev.section,
    }));
  }

  const subjectTopics: string[] = useMemo(() => {
    if (!inputs.subject) return [];
    if (typeof topicsBySubject === "function") {
      return topicsBySubject(inputs.subject) || [];
    }
    const dict = topicsBySubject as Record<string, string[]> | undefined;
    return dict?.[inputs.subject] || [];
  }, [inputs.subject, topicsBySubject]);

  const effectiveTopic =
    inputs.topic === "Other" ? (inputs.topicOther || "").trim() : inputs.topic;

  const notes = useMemo(() => {
    if (!inputs.subject || !effectiveTopic) return null;
    if (typeof getTeachingNotes === "function") {
      return getTeachingNotes(inputs.subject, effectiveTopic);
    }
    return null;
  }, [inputs.subject, effectiveTopic, getTeachingNotes]);

  function saveLessonPlan() {
    if (typeof upsertLessonPlan === "function" && selected) {
      upsertLessonPlan({
        dateISO,
        periodId: selected.id,
        subject: inputs.subject,
        className: inputs.className,
        section: inputs.section,
        topic: effectiveTopic,
      });
    }
  }

  function prepareLecturePlan() {
    if (!inputs.subject || !effectiveTopic || !inputs.className) return;

    const plan: LecturePlan = {
      meta: {
        subject: inputs.subject,
        className: inputs.className,
        section: inputs.section,
        topic: effectiveTopic,
        durationMins: 40,
      },
      objectives: [
        "Define key terms and symbols.",
        "Explain relationships between core ideas.",
        "Apply the concept to two real‑world examples.",
      ],
      hook:
        "Open with a 60–90s demo/visual or quick thought experiment to spark curiosity.",
      activities: [
        { title: "Think–Pair–Share", minutes: 8, materials: "Notebook" },
        {
          title: "Guided Example + Error Analysis",
          minutes: 10,
          materials: "Projector/board",
        },
        { title: "Mini Whiteboard Check", minutes: 6, materials: "Markers" },
        { title: "Independent Practice (2–3 Qs)", minutes: 8 },
      ],
      differentiation: [
        "Scaffolded version of main problem for support.",
        "Extension challenge for fast finishers.",
      ],
      checksForUnderstanding: [
        "Cold‑call 3–4 students on the core concept.",
        "2‑question exit ticket on the likely misconception.",
      ],
      materials: ["Projector", "Worksheets", "Markers"],
      timing: [
        { block: "Hook", minutes: 4 },
        { block: "Core Teaching", minutes: 15 },
        { block: "Guided Practice", minutes: 12 },
        { block: "Exit Ticket", minutes: 9 },
      ],
    };

    // send to right column via store
    setLecturePlan(plan);
    setRightTab?.("plan");
  }

  const canPrepare =
    Boolean(inputs.subject) && Boolean(effectiveTopic) && Boolean(inputs.className);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl ">Teacher — Planner</h2>

      <Card title="Pick a date">
        <div className="flex items-center gap-3">
          <input
            type="date"
            className="rounded-xl border border-slate-200 px-3 py-2 bg-white"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
          />
          <div className="text-sm text-slate-600">
            Showing timetable & notes for: <span className="font-medium">{dateISO}</span>
          </div>
        </div>
      </Card>

      <Card title="Day Timetable">
        {rows.length === 0 ? (
          <div className="text-sm text-slate-500">No periods scheduled for this date.</div>
        ) : (
          <div className="divide-y">
            {rows.map((r: any, i: number) => (
              <button
                key={r.id || i}
                onClick={() => pickRow(i)}
                className={`w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 ${
                  selectedRow === i ? "bg-slate-50 ring-1 ring-slate-200" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    Period {r.period ?? i + 1} — {r.subject}
                  </div>
                  <div className="text-sm text-slate-600">
                    Class {r.className}
                    {r.section ? `-${r.section}` : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card title="Lesson Details">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Subject */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">Subject</label>
            <select
              value={inputs.subject}
              onChange={(e) =>
                setInputs((p) => ({ ...p, subject: e.target.value, topic: "", topicOther: "" }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
            >
              <option value="">Select</option>
              {subjects?.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">Class</label>
            <select
              value={inputs.className}
              onChange={(e) => setInputs((p) => ({ ...p, className: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
            >
              <option value="">Select</option>
              {classesList?.map((c: string) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">Section</label>
            <select
              value={inputs.section}
              onChange={(e) => setInputs((p) => ({ ...p, section: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
            >
              <option value="">Select</option>
              {sections?.map((sec: string) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">Topic / Chapter</label>
            <div className="flex gap-2">
              <select
                value={inputs.topic}
                onChange={(e) => setInputs((p) => ({ ...p, topic: e.target.value, topicOther: "" }))}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 bg-white"
              >
                <option value="">Select</option>
                {subjectTopics?.map((t: string) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="Other">Other…</option>
              </select>
            </div>
            {inputs.topic === "Other" && (
              <input
                placeholder="Enter custom topic"
                value={inputs.topicOther}
                onChange={(e) => setInputs((p) => ({ ...p, topicOther: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={saveLessonPlan}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          >
            Generate Quick Notes
          </button>

          <button
            onClick={prepareLecturePlan}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50"
            disabled={!canPrepare}
            title={canPrepare ? "" : "Select Subject, Class and Topic to prepare a plan"}
          >
            Prepare Lecture Plan
          </button>

          {selected && (
            <div className="text-xs text-slate-600">
              Saving for <span className="font-medium">{dateISO}</span>, Period{" "}
              {selected.period ?? selectedRow! + 1}
            </div>
          )}
        </div>

        {/* Teaching notes */}
        {inputs.subject && effectiveTopic && (
          <Card title={`${inputs.subject} — ${effectiveTopic}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Core Concepts</h3>
                <span className="text-xs text-slate-500">
                  {notes?.coreConcepts?.length ?? 0} points
                </span>
              </div>

              <ul className="list-disc pl-5 leading-6 text-[15px] text-slate-700 max-h-64 overflow-auto pr-2">
                {notes?.coreConcepts?.length ? (
                  notes.coreConcepts.map((t: string, i: number) => (
                    <li key={i} className="mb-1.5">
                      {t}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No core concepts available.</li>
                )}
              </ul>

              <div className="h-px bg-slate-200 my-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
                  <div className="font-medium mb-1">Tips</div>
                  <ul className="list-disc pl-5 text-sm leading-6">
                    {notes?.tips?.length ? (
                      notes.tips.map((t: string, i: number) => <li key={i}>{t}</li>)
                    ) : (
                      <li className="text-slate-500">No tips available.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
                  <div className="font-medium mb-1">Examples</div>
                  <ul className="list-disc pl-5 text-sm leading-6">
                    {notes?.examples?.length ? (
                      notes.examples.map((t: string, i: number) => <li key={i}>{t}</li>)
                    ) : (
                      <li className="text-slate-500">No examples available.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
}

/* ------------- RIGHT: Tabs + Engagement + Plan ------------- */
export function Right() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [dateISO, setDateISO] = useState<string>(todayISO);
  const [className, setClassName] = useState<string>("");
  const [section, setSection] = useState<string>("");

  const {
    classesList = [],
    sections = [],
    getEngagement,
    // 🔑 UI state
    rightTab = "engagement",
    setRightTab = () => {},
    lecturePlan = null,
  } = useAppStore((s: any) => ({
    classesList: s.classesList,
    sections: s.sections,
    getEngagement: s.getEngagement,
    rightTab: s.rightTab,
    setRightTab: s.setRightTab,
    lecturePlan: s.lecturePlan,
  }));

  const engagement =
    typeof getEngagement === "function"
      ? getEngagement(dateISO, className || undefined, section || undefined) || []
      : [];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1.5 rounded-lg border ${
            rightTab === "engagement" ? "bg-slate-900 text-white" : "bg-white"
          }`}
          onClick={() => setRightTab("engagement")}
        >
          Engagement
        </button>
        <button
          className={`px-3 py-1.5 rounded-lg border ${
            rightTab === "plan" ? "bg-slate-900 text-white" : "bg-white"
          }`}
          onClick={() => setRightTab("plan")}
        >
          Lecture Plan
        </button>
      </div>

      {rightTab === "engagement" ? (
        <>
          <h2 className="text-2xl ">Class Revision and Quiz Engagement</h2>

          <Card title="Filters">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                  value={dateISO}
                  onChange={(e) => setDateISO(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Class (optional)</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                  value={className}
                  onChange={(e) => {
                    setClassName(e.target.value);
                    setSection("");
                  }}
                >
                  <option value="">All Classes</option>
                  {classesList?.map((c: string) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Section (optional)</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  disabled={!className}
                >
                  <option value="">{className ? "All Sections" : "Select a class first"}</option>
                  {className &&
                    sections?.map((s: string) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </Card>

          <Card title="Engagement by Roll Number">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Roll No</th>
                    <th className="border px-2 py-1">Progress (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {engagement.map((s: any) => (
                    <tr key={s.name}>
                      <td className="border px-2 py-1">{s.name}</td>
                      <td className="border px-2 py-1">{s.progress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <>
          <h2 className="text-2xl ">Lecture Plan</h2>
          {!lecturePlan ? (
            <div className="text-sm text-slate-500">
              No plan yet. Use “Prepare Lecture Plan” on the left.
            </div>
          ) : (
            <div className="space-y-3">
              <Card
                title={`${lecturePlan.meta.subject} — ${lecturePlan.meta.topic} (Class ${lecturePlan.meta.className}${
                  lecturePlan.meta.section ? "-" + lecturePlan.meta.section : ""
                })`}
              >
                <div className="text-sm text-slate-600 mb-2">
                  Duration: {lecturePlan.meta.durationMins} mins
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <section className="rounded-xl border p-3">
                    <h3 className="font-medium mb-1">Objectives</h3>
                    <ul className="list-disc pl-5 text-sm leading-6">
                      {lecturePlan.objectives.map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-xl border p-3">
                    <h3 className="font-medium mb-1">Hook</h3>
                    <p className="text-sm leading-6">{lecturePlan.hook}</p>
                  </section>

                  <section className="rounded-xl border p-3 md:col-span-2">
                    <h3 className="font-medium mb-1">Activities</h3>
                    <ul className="list-disc pl-5 text-sm leading-6">
                      {lecturePlan.activities.map((a, i) => (
                        <li key={i}>
                          <span className="font-medium">{a.title}</span>
                          {a.minutes ? ` — ${a.minutes} mins` : ""}
                          {a.materials ? ` — ${a.materials}` : ""}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-xl border p-3">
                    <h3 className="font-medium mb-1">Differentiation</h3>
                    <ul className="list-disc pl-5 text-sm leading-6">
                      {lecturePlan.differentiation.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-xl border p-3">
                    <h3 className="font-medium mb-1">Checks for Understanding</h3>
                    <ul className="list-disc pl-5 text-sm leading-6">
                      {lecturePlan.checksForUnderstanding.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-xl border p-3 md:col-span-2">
                    <h3 className="font-medium mb-1">Materials</h3>
                    <p className="text-sm leading-6">{lecturePlan.materials.join(", ")}</p>
                  </section>

                  <section className="rounded-xl border p-3 md:col-span-2">
                    <h3 className="font-medium mb-1">Timing</h3>
                    <ul className="list-disc pl-5 text-sm leading-6">
                      {lecturePlan.timing.map((t, i) => (
                        <li key={i}>
                          {t.block}: {t.minutes} mins
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
