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
  const [showPlanModal, setShowPlanModal] = useState(false);
const [previewPlan, setPreviewPlan] = useState<LecturePlan | null>(null);

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
    generateLecturePlan,
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
    generateLecturePlan: s.generateLecturePlan,
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
    
  }


  function handleGenerateLecturePlan() {
    if (!canPrepare || typeof generateLecturePlan !== "function") return;
    const plan = generateLecturePlan({
      subject: inputs.subject,
      className: inputs.className,
      section: inputs.section,
      topic: effectiveTopic,
    });
    console.log("Generated Lecture Plan:", plan);
    if (plan) {
      setLecturePlan(plan);
      setRightTab("plan");
    }

    setTimeout(() => {
    // Zustand lets you read current state like this:
    const now = (useAppStore as any).getState?.().rightTab;
    if (now !== "plan") {
      setPreviewPlan(plan);
      setShowPlanModal(true);
    }
  }, 60);
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

            <div className="mt-4 flex items-center gap-3">
              {/* Pastel green */}
              <button
                onClick={saveLessonPlan}
                className="px-4 py-2 rounded-xl bg-pastelGreen text-slate-900 border border-slate-200 shadow-soft
                          hover:bg-pastelGreen/90 focus:outline-none focus:ring-2 focus:ring-slate-300
                          active:translate-y-[1px] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Generate Quick Notes
              </button>

              {/* Pastel yellow */}
              <button
                // add your onClick if this should do something
                  onClick={handleGenerateLecturePlan}
                className="px-4 py-2 rounded-xl bg-pastelYellow text-slate-900 border border-slate-200 shadow-soft
                          hover:bg-pastelYellow/90 focus:outline-none focus:ring-2 focus:ring-slate-300
                          active:translate-y-[1px] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Prepare Lecture Plan
              </button>
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
      {showPlanModal && previewPlan && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-soft p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">
          {previewPlan.meta.subject} — {previewPlan.meta.topic} (Class {previewPlan.meta.className}
          {previewPlan.meta.section ? `-${previewPlan.meta.section}` : ""})
        </h3>
        <button
          onClick={() => setShowPlanModal(false)}
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          Close
        </button>
      </div>

      <div className="text-sm text-slate-600 mb-3">
        Duration: {previewPlan.meta.durationMins} mins
      </div>

      <div className="grid md:grid-cols-2 gap-3 max-h-[60vh] overflow-auto pr-1">
        <section className="rounded-xl border p-3">
          <h4 className="font-medium mb-1">Objectives</h4>
          <ul className="list-disc pl-5 text-sm leading-6">
            {previewPlan.objectives.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </section>

        <section className="rounded-xl border p-3">
          <h4 className="font-medium mb-1">Hook</h4>
          <p className="text-sm leading-6">{previewPlan.hook}</p>
        </section>

        <section className="rounded-xl border p-3 md:col-span-2">
          <h4 className="font-medium mb-1">Activities</h4>
          <ul className="list-disc pl-5 text-sm leading-6">
            {previewPlan.activities.map((a, i) => (
              <li key={i}>
                <span className="font-medium">{a.title}</span>
                {a.minutes ? ` — ${a.minutes} mins` : ""}
                {a.materials ? ` — ${a.materials}` : ""}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border p-3">
          <h4 className="font-medium mb-1">Differentiation</h4>
          <ul className="list-disc pl-5 text-sm leading-6">
            {previewPlan.differentiation.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </section>

        <section className="rounded-xl border p-3">
          <h4 className="font-medium mb-1">Checks for Understanding</h4>
          <ul className="list-disc pl-5 text-sm leading-6">
            {previewPlan.checksForUnderstanding.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </section>

        <section className="rounded-xl border p-3 md:col-span-2">
          <h4 className="font-medium mb-1">Materials</h4>
          <p className="text-sm leading-6">{previewPlan.materials.join(", ")}</p>
        </section>

        <section className="rounded-xl border p-3 md:col-span-2">
          <h4 className="font-medium mb-1">Timing</h4>
          <ul className="list-disc pl-5 text-sm leading-6">
            {previewPlan.timing.map((t, i) => (
              <li key={i}>{t.block}: {t.minutes} mins</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={() => {
            setShowPlanModal(false);
            setRightTab?.("plan");
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
        >
          Open in right panel
        </button>
        <button
          onClick={() => setShowPlanModal(false)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
        >
          Keep it here
        </button>
      </div>
    </div>
  </div>
)}

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


    const engagement = typeof getEngagement === "function"
  ? getEngagement({ dateISO, className: className || undefined, section: section || undefined }) || []
  : [];
 
  return (
    <div className="space-y-4">
      {/* Tabs */}
      {/* Tabs */}
<div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-soft">
<button
  className={`px-3 py-1.5 rounded-lg transition font-medium
    ${rightTab === "engagement"
      ? "bg-pastelGreen text-slate-900 shadow-soft ring-1 ring-slate-300"
      : "text-slate-700 hover:bg-emerald-50"}`
  }
  onClick={() => setRightTab("engagement")}
>
  Engagement
</button>
  <button
    className={`px-3 py-1.5 rounded-lg transition ${
      rightTab === "plan" ? "bg-slate-900 text-white shadow" : "text-slate-700 hover:bg-slate-50"
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
  <div className="space-y-2 max-h-96 overflow-auto pr-2">
    {engagement.map((s: any, i: number) => (
      <div key={s.name || i} className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-soft">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">
            {s.rollNo ? `Student ${s.rollNo}` : s.name}
          </span>
          <span className="text-sm text-slate-600">{s.progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
  className="h-2 rounded-full bg-emerald-600"
  style={{ width: `${Math.max(0, Math.min(100, s.progress ?? 0))}%` }}
/>
        </div>
      </div>
    ))}
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
                      {lecturePlan.objectives.map((o: string, i: number) => (
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
                              {lecturePlan.activities.map(
            (a: { title: string; minutes?: number; materials?: string }, i: number) => (
              <li key={i}>
                <span className="font-medium">{a.title}</span>
                {a.minutes ? ` — ${a.minutes} mins` : ""}
                {a.materials ? ` — ${a.materials}` : ""}
              </li>
            )
          )}

                    </ul>
                  </section>

                  <section className="rounded-xl border p-3">
                    <h3 className="font-medium mb-1">Differentiation</h3>
                    <ul className="list-disc pl-5 text-sm leading-6">
                  {lecturePlan.differentiation.map((d: string, i: number) => (
  <li key={i}>{d}</li>
))}

                    </ul>
                  </section>

                  <section className="rounded-xl border p-3">
                    <h3 className="font-medium mb-1">Checks for Understanding</h3>
                    <ul className="list-disc pl-5 text-sm leading-6">
                    {lecturePlan.checksForUnderstanding.map((c: string, i: number) => (
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
                     {lecturePlan.timing.map((t: { block: string; minutes: number }, i: number) => (
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
