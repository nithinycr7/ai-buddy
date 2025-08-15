import { Link } from "react-router-dom";

export default function PersonalityHome() {
  return (
    <div className="mx-auto max-w-[900px] p-4">
      <h1 className="text-2xl mb-4 header-hand">Personality Development</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          to="communication"
          className="rounded-2xl p-4 border shadow-soft bg-white hover:bg-emerald-50"
        >
          <div className="text-xl mb-2">🗣️ Communication Skills</div>
          <div className="text-slate-600 text-sm">
            Voice conversation with on‑screen transcript & nudges.
          </div>
        </Link>
        <Link to="hobby" className="rounded-2xl p-4 border shadow-soft bg-white hover:bg-indigo-50">
          <div className="text-xl mb-2">🎯 Hobby Development</div>
          <div className="text-slate-600 text-sm">
            Pick a hobby → 30‑day plan; unlock one day at a time.
          </div>
        </Link>
        <Link
          to="grievance"
          className="rounded-2xl p-4 border shadow-soft bg-white hover:bg-rose-50"
        >
          <div className="text-xl mb-2">💬 Grievance Redressal</div>
          <div className="text-slate-600 text-sm">
            Drop a grievance; teacher & parent get notified.
          </div>
        </Link>
      </div>
    </div>
  );
}
