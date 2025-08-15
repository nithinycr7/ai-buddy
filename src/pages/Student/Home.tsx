import { useState } from "react";
import Card from "../../components/UI/Card";
import ProgressRing from "../../components/UI/ProgressRing";
import StickyNote from "../../components/UI/StickyNote";
import Leaderboard from "../../components/UI/Leaderboard";
import { useAppStore } from "../../store/useAppStore";
import { useNavigate } from "react-router-dom";

function Left() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(todayISO);

  const getClassesFor = useAppStore(s => s.getClassesFor);
  const classesForDay = getClassesFor(date);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-2xl header-hand">Today’s Page</h2>
        {/* Date picker */}
        <div className="text-sm">
          <label htmlFor="class-date" className="mr-2 text-slate-600">
            Pick a date
          </label>
          <input
            id="class-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border rounded-xl px-3 py-1.5 bg-white"
          />
        </div>
      </div>

      <div className="space-y-3">
        {classesForDay.length === 0 ? (
          <Card>
            <div className="text-sm text-slate-600">
              No classes scheduled for <span className="font-semibold">{date}</span>.
            </div>
          </Card>
        ) : (
          classesForDay.slice(0, 4).map(c => (
            <Card key={c.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg">
                    {c.icon} {c.title} — {c.topic}
                  </div>
                  <div className="text-sm text-slate-600 max-w-prose">{c.summary}</div>
                  <div className="flex gap-2 mt-2">
                    <a href="/student/replay" className="px-3 py-1.5 rounded-lg bg-pastelGreen">
                      Revise
                    </a>
                    <a href="/student/quiz" className="px-3 py-1.5 rounded-lg bg-pastelYellow">
                      Quiz
                    </a>
                  </div>
                </div>
                <div className="shrink-0">
                  <ProgressRing value={c.progress} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      {/* --- New: Bottom actions on home page --- */}
      <div className="pt-2">
        <div className="rounded-2xl border bg-white p-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="/student/personality"
              className="w-full text-center px-4 py-3 rounded-xl bg-indigo-600 text-white shadow-soft hover:bg-indigo-500"
            >
              Personality Development
            </a>
            <a
              href="/student/assignments"
              className="w-full text-center px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-soft hover:bg-emerald-500"
            >
              Home Assignments
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Right() {
  const navigate = useNavigate();
  const tip = useAppStore(s => s.aiTip);
  const exams = useAppStore(s => s.upcomingExams);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* <Card title="Today’s Progress">
        <div className="flex items-center justify-center">
          <ProgressRing value={0.72} size={170}/>
        </div>
      </Card> */}

      {/* NEW: Upcoming Exams */}

      {/* Optional tip sticky stays */}
      <StickyNote>
        <span className="whitespace-pre-line">{tip}</span>
      </StickyNote>
      <Card title="Upcoming Exams">
        {exams.length === 0 ? (
          <div className="text-sm text-slate-600">No upcoming exams scheduled.</div>
        ) : (
          <ul className="space-y-3">
            {exams.map(ex => (
              <li key={ex.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">
                    {ex.subject} — <span className="text-slate-700">{ex.topic}</span>
                  </div>
                  <div className="text-xs text-slate-500">{fmt(ex.dateISO)}</div>
                </div>
                <button
                  onClick={() => navigate(`/student/replay?exam=${encodeURIComponent(ex.id)}`)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-pastelGreen border shadow-soft hover:bg-emerald-100 text-sm"
                >
                  Help me revise
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => navigate("/student/journal?plan=revision")}
          className="mt-6 w-full px-4 py-3 rounded-xl bg-slate-800 text-white shadow-soft hover:bg-slate-700"
        >
          Let’s schedule a timetable for the revision
        </button>
      </Card>

      {/* CTA under the card */}

      <Card>
        <Leaderboard />
      </Card>
    </div>
  );
}
export default { Left, Right };
