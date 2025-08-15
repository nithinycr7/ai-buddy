// src/pages/parent/Dashboard.tsx
import { useMemo, useState } from "react";
import Card from "../../components/UI/Card";
import ParentAdminUtility from "./ParentAdminUtility";

/* -------------------- date helpers -------------------- */
function startOfWeek(d: Date) {
  // Snap to Monday
  const dt = new Date(d);
  const day = dt.getDay(); // 0=Sun..6=Sat
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
function fmtShort(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function fmtRange(monday: Date) {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  if (sameMonth) {
    const m = monday.toLocaleDateString(undefined, { month: "short" });
    return `${m} ${monday.getDate()}–${sunday.getDate()}, ${sunday.getFullYear()}`;
  }
  return `${fmtShort(monday)} – ${fmtShort(sunday)}, ${sunday.getFullYear()}`;
}

/* -------------------- deterministic mock data -------------------- */
/** Replace this with your API. It just returns 7 numbers (Mon..Sun) in 0..100. */
function seededWeekProgress(monday: Date) {
  const seedStr = monday.toISOString().slice(0, 10);
  // Tiny string hash
  let x = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    x ^= seedStr.charCodeAt(i);
    x += (x << 1) + (x << 4) + (x << 7) + (x << 8) + (x << 24);
  }
  x >>>= 0;

  const arr: number[] = [];
  for (let i = 0; i < 7; i++) {
    // Simple LCG-ish for stable numbers
    x = (1103515245 * x + 12345) % 2 ** 31;
    const val = Math.max(0, Math.min(100, x % 101));
    arr.push(val);
  }
  return arr;
}

/* -------------------- UI helpers -------------------- */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

/* -------------------- Weekly Performance -------------------- */
function WeeklyPerformance() {
  const [monday, setMonday] = useState<Date>(() => startOfWeek(new Date()));

  // Replace this useMemo with your fetch once you have an API
  const progress = useMemo(() => seededWeekProgress(monday), [monday]);

  function jumpTo(val: string) {
    if (!val) return;
    setMonday(startOfWeek(new Date(val)));
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl header-hand">Parent — Weekly Performance</h2>

      <Card>
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <IconBtn onClick={() => setMonday((d) => addDays(d, -7))} label="Previous week">
              ‹
            </IconBtn>
            <div className="text-sm font-medium text-slate-700">
              Week of <span className="font-semibold">{fmtRange(monday)}</span>
            </div>
            <IconBtn onClick={() => setMonday((d) => addDays(d, +7))} label="Next week">
              ›
            </IconBtn>
          </div>

          <label className="text-sm flex items-center gap-2">
            <span className="text-slate-600">Jump to</span>
            <input
              type="date"
              className="rounded-xl border border-slate-200 px-3 py-1.5"
              value={monday.toISOString().slice(0, 10)}
              onChange={(e) => jumpTo(e.target.value)}
            />
          </label>
        </div>

        {/* Bars */}
        <div className="h-48 rounded-xl bg-pastelYellow/60 p-3">
          <div className="h-full grid grid-cols-7 items-end gap-2">
            {progress.map((pct, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  title={`${DAYS[i]} • ${pct}% progress`}
                  style={{ height: `${pct}%` }}
                  className="w-6 md:w-7 bg-white border rounded-t shadow-sm"
                />
                <div className="text-[11px] text-slate-600">{DAYS[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Bars show % <strong>progress</strong> completed each day (Mon–Sun) for the selected week.
        </div>
      </Card>
    </section>
  );
}

/* -------------------- Right panel -------------------- */
function RightPanel() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl header-hand">Highlights & Support</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <Card title="Highlights">
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Top 10% in Biology quiz</li>
            <li>Completed 3 assignments early</li>
            <li>Examinations starting next week</li>
          </ul>
        </Card>
        <Card title="Areas to Support">
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Practice quadratic equations</li>
            <li>Read chapter summary together</li>
          </ul>
        </Card>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded-xl bg-pastelGreen">Send Encouragement</button>
        <button className="px-3 py-2 rounded-xl bg-pastelBlue">Request Meeting</button>
      </div>
    </section>
  );
}

/* -------------------- Page -------------------- */
export default function ParentDashboard() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyPerformance />
        <RightPanel />

        {/* Bottom full-width card */}
        <Card className="lg:col-span-2" >
          <ParentAdminUtility />
        </Card>
      </div>
    </div>
  );
}
