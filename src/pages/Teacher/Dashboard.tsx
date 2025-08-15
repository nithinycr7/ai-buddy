// src/pages/Teacher/Dashboard.tsx
import { useMemo, useState } from "react";
import { DatePicker } from "../../components/Inputs/DatePicker"; // if you don't have one, swap for <input type="date" />
import Card from "../../components/UI/Card";
import { useAppStore } from "../../store/useAppStore";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

type LessonPlanInput = {
  subject: string;
  className: string;
  section: string;
  topic: string;
  topicOther?: string;
};

function Left() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [dateISO, setDateISO] = useState<string>(todayISO);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // ---- Zustand selectors (all optional-friendly) ----
  const {
    // timetable
    getTimetableForDate,
    timetable, // optional object: { [dateISO]: Array<{id, period, subject, className, section}> }
    // meta
    subjects = [],
    classesList = [],
    sections = [],
    topicsBySubject,
    // notes
    getTeachingNotes,
    // write
    upsertLessonPlan,
  } = useAppStore(s => ({
    getTimetableForDate: (s as any).getTimetableForDate,
    timetable: (s as any).timetable,
    subjects: (s as any).subjects,
    classesList: (s as any).classesList,
    sections: (s as any).sections,
    topicsBySubject: (s as any).topicsBySubject,
    getTeachingNotes: (s as any).getTeachingNotes,
    upsertLessonPlan: (s as any).upsertLessonPlan,
  }));

  // timetable rows for the chosen date – prefers selector, falls back to map
  const rows = useMemo(() => {
    if (typeof getTimetableForDate === "function") return getTimetableForDate(dateISO) || [];
    if (timetable && timetable[dateISO]) return timetable[dateISO];
    return [];
  }, [dateISO, getTimetableForDate, timetable]);

  const selected = selectedRow != null ? rows[selectedRow] : null;

  // controlled inputs for the “Day Timetable → bottom card”
  const [inputs, setInputs] = useState<LessonPlanInput>({
    subject: "",
    className: "",
    section: "",
    topic: "",
    topicOther: "",
  });

  // when a row is picked, prefill subject/class/section from that row
  function pickRow(i: number) {
    setSelectedRow(i);
    const r = rows[i];
    if (!r) return;
    setInputs(prev => ({
      ...prev,
      subject: r.subject || prev.subject,
      className: r.className || prev.className,
      section: r.section || prev.section,
    }));
  }

  // topic list from store for chosen subject
  const subjectTopics: string[] = useMemo(() => {
    if (!inputs.subject) return [];
    if (typeof topicsBySubject === "function") {
      return topicsBySubject(inputs.subject) || [];
    }
    const dict = topicsBySubject as Record<string, string[]> | undefined;
    return dict?.[inputs.subject] || [];
  }, [inputs.subject, topicsBySubject]);

  const effectiveTopic = inputs.topic === "Other" ? (inputs.topicOther || "").trim() : inputs.topic;

  // notes from store (tips/examples/core concepts)
  const notes = useMemo(() => {
    if (!inputs.subject || !effectiveTopic) return null;
    if (typeof getTeachingNotes === "function") {
      return getTeachingNotes(inputs.subject, effectiveTopic); // expected: { tips: string[], examples: string[], coreConcepts: string[] }
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl header-hand">Teacher — Planner</h2>

      {/* Calendar + Date */}
      <Card title="Pick a date">
        <div className="flex items-center gap-3">
          {/* swap for your Calendar if you have one */}
          <input
            type="date"
            className="rounded-xl border border-slate-200 px-3 py-2 bg-white"
            value={dateISO}
            onChange={e => setDateISO(e.target.value)}
          />
          <div className="text-sm text-slate-600">
            Showing timetable & notes for: <span className="font-medium">{dateISO}</span>
          </div>
        </div>
      </Card>

      {/* Day Timetable */}
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

      {/* Edit / Confirm lesson details + show notes */}
      <Card title="Lesson Details">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Subject */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">Subject</label>
            <select
              value={inputs.subject}
              onChange={e =>
                setInputs(p => ({ ...p, subject: e.target.value, topic: "", topicOther: "" }))
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
              onChange={e => setInputs(p => ({ ...p, className: e.target.value }))}
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
              onChange={e => setInputs(p => ({ ...p, section: e.target.value }))}
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
                onChange={e => setInputs(p => ({ ...p, topic: e.target.value, topicOther: "" }))}
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
                onChange={e => setInputs(p => ({ ...p, topicOther: e.target.value }))}
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
            Save to timetable
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
            {/* Core Concepts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Core Concepts</h3>
                {/* optional count */}
                <span className="text-xs text-slate-500">
                  {notes?.coreConcepts?.length ?? 0} points
                </span>
              </div>

              {/* scrollable list, clean bullets, comfy line-height */}
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

              {/* Divider */}
              <div className="h-px bg-slate-200 my-2" />

              {/* Tips + Examples footer (2-cols on desktop, 1-col on mobile) */}
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

function Right() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [dateISO, setDateISO] = useState<string>(todayISO);
  const [className, setClassName] = useState<string>("");
  const [section, setSection] = useState<string>("");

  const {
    classesList = [],
    sections = [],
    getEngagement, // fn(dateISO, class?, section?) => number[]
  } = useAppStore(s => ({
    classesList: (s as any).classesList,
    sections: (s as any).sections,
    getEngagement: (s as any).getEngagement,
  }));

  // const engagement: number[] = useMemo(() => {
  //   if (typeof getEngagement === 'function') {
  //     return getEngagement(dateISO, className || undefined, section || undefined) || []
  //   }
  //   return [] // no fallback data here (per your request)
  // }, [dateISO, className, section, getEngagement])

  const engagement = getEngagement(dateISO, className || undefined, section || undefined);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl header-hand">Class Revision and Quiz Engagement</h2>

      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
              value={dateISO}
              onChange={e => setDateISO(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Class (optional)</label>
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
              value={className}
              onChange={e => {
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
              onChange={e => setSection(e.target.value)}
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
              {engagement.map(s => (
                <tr key={s.name}>
                  <td className="border px-2 py-1">{s.name}</td>
                  <td className="border px-2 py-1">{s.progress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default { Left, Right };
