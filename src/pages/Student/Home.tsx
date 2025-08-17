import { useState } from "react";
import Card from "../../components/UI/Card";
import StickyNote from "../../components/UI/StickyNote";
import Leaderboard from "../../components/UI/Leaderboard";
import { useAppStore } from "../../store/useAppStore";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import LectureCard from "./components/LectureCard/LectureCard";

function Left() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(todayISO);
  const [active, setActive] = useState<string>("revision");

  const getClassesFor = useAppStore(s => s.getClassesFor);
  const classesForDay = getClassesFor(date);
  const subjects = useAppStore(s => s.subjects);
  const navigate = useNavigate();

  const tabs = [
    { id: "revision", label: "Today's Revision" },
    { id: "subjects", label: "Subjects" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 mb-2">
        {tabs.map(({ id, label }, index) => {
          const isActive = active === id;
          return (
            <div
              key={index}
              className={cn(
                "py-2 grid place-items-center border shadow-soft bg-white cursor-pointer",
                isActive && "bg-pastelGreen border-emerald-300"
              )}
              onClick={() => setActive(id)}
            >
              {label}
            </div>
          );
        })}
      </div>
      <div className="page space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-2xl ">{active === "revision" ? "Today's Revision" : "Subjects"}</h2>
          {active === "revision" && (
            <div className="flex items-center gap-4 text-sm">
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
          )}
        </div>

        {active === "revision" ? (
          <>
            <div className="space-y-3">
              {classesForDay.length === 0 ? (
                <Card>
                  <div className="text-sm text-slate-600">
                    No classes scheduled for <span className="font-semibold">{date}</span>.
                  </div>
                </Card>
              ) : (
                classesForDay.slice(0, 4).map(c => <LectureCard key={c.id} lectureData={c} />)
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              {subjects.map(s => (
                <Card key={s}>
                  <button
                    onClick={() => navigate(`/student/subject/${encodeURIComponent(s)}`)}
                    className="w-full text-left flex items-center gap-3 px-3 py-3"
                  >
                    <div className="text-lg font-medium">{s}</div>
                    <div className="ml-auto text-sm text-slate-500">Open</div>
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}
        {/* --- Bottom actions --- */}
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
