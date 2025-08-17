import { NavLink, useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { to: "/", label: "Today", icon: "🗓️" },
  // { to: '/student/journal', label: 'Journal', icon: '📒' },
  // { to: '/student/quiz', label: 'Quizzes', icon: '📝' },
  { to: "/teacher", label: "Teacher", icon: "👩‍🏫" },
  { to: "/parent", label: "Parent", icon: "👨‍👩‍👧" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isReplayPage = pathname === "/student/replay" || pathname.startsWith("/home");

  return (
    <div className="toolbar">
      {isReplayPage ? (
        // Show only the Let's Practice button
        <button
          onClick={() => navigate("/student/quiz")}
          aria-label="Go to Quiz"
          className="px-4 py-2 rounded-full bg-slate-800 text-white text-sm shadow-soft hover:bg-slate-700"
        >
          Let’s Practice the Quiz
        </button>
      ) : (
        // Show all other nav tabs
        tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl text-sm flex items-center gap-1 ${
                isActive ? "bg-pastelBlue ring-2 ring-slate-700" : "hover:bg-white"
              }`
            }
          >
            <span>{t.icon}</span>
            <span className="">{t.label}</span>
          </NavLink>
        ))
      )}
    </div>
  );
}
