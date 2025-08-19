// src/components/Header.tsx
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  BellIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store/useAppStore";
import { useLocation } from "react-router-dom";

// Personas (unchanged)
const PERSONA_TAGS = [
  { label: "Math Whiz", emoji: "🧮" },
  { label: "Science Explorer", emoji: "🔬" },
  { label: "History Buff", emoji: "📜" },
  { label: "Language Lover", emoji: "🗣️" },
];

// Achievements (single-line, uniform height)
const ACHIEVEMENTS = [
  {
    key: "accuracy",
    emoji: "🎯",
    title: "Accuracy Champion",
    subtitle: "",
    style: "pill", // icon + text side-by-side
  },
  {
    key: "consistency",
    emoji: "🏅",
    title: "Consistent Performer",
    subtitle: "",
    style: "medal", // medal + side tag (same height)
  },
];

function PillBadge({ emoji, text }: { emoji: string; text: string }) {
  return (
    <span
      className="
        shrink-0 inline-flex h-9 items-center gap-2
        rounded-full border border-slate-200 bg-white
        px-3 text-xs font-semibold text-slate-700
        shadow-sm hover:bg-slate-50
      "
    >
      <span className="text-base leading-none">{emoji}</span>
      {text}
    </span>
  );
}

function MedalBadgeSideTag({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <span
      className="
        shrink-0 inline-flex h-9 items-center
        rounded-full bg-white shadow-sm border border-slate-200
        overflow-hidden
      "
      title={`${title} – ${subtitle}`}
      aria-label={`${title} – ${subtitle}`}
    >
      {/* medal circle */}
      <span
        className="
          h-9 w-9 grid place-items-center
          bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-100
          ring-1 ring-amber-300
          text-base
        "
      >
        {emoji}
      </span>
      {/* side tag (kept same height) */}
      <span className="px-3 text-xs font-semibold text-slate-700">
        {title} · <span className="font-medium text-slate-600">{subtitle}</span>
      </span>
    </span>
  );
}

export default function Header() {
  const user = useAppStore((s) => s.user);
  const location = useLocation();

  // show badges only on /student pages (handles /student, /student/..., etc.)
  const showBadges = location.pathname === "/" || location.pathname.startsWith("/student");


  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="backdrop-blur bg-white/80 border-b border-slate-200 shadow-[0_1px_0_0_rgba(15,23,42,0.04)]">
        <div className="mx-auto max-w-[1400px] px-4">
          {/* 3-column grid keeps center perfectly centered */}
          <div className="h-16 grid grid-cols-3 items-center">
            {/* LEFT: brand */}
            <div className="flex items-center gap-3">
              {user?.schoolLogoUrl ? (
                <img
                  src={user.schoolLogoUrl}
                  alt="School Logo"
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg grid place-items-center bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                  🏫
                </div>
              )}
              {/* <div className="hidden sm:block">
                <div className="text-xs font-medium text-slate-500 -mb-0.5 tracking-wide">
                  Welcome,
                </div>
                <div className="text-sm font-semibold text-slate-800 leading-none">
                  {user?.name || "Student"}
                </div>
              </div> */}
            </div>

            {/* CENTER: toned-down title */}
            <div className="justify-self-center w-full max-w-md">
              <div className="flex flex-col items-center gap-1">
                <h1
                  className="
                    text-lg sm:text-xl font-bold leading-none text-slate-800
                    tracking-tight
                  "
                  title="AI Buddy"
                >
                  <span className="align-middle">AI Buddy</span>
                </h1>
                {/* subtle accent dots */}
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                </div>
              </div>
            </div>

            {/* RIGHT: utilities + profile */}
            <div className="justify-self-end flex items-center gap-2 sm:gap-3">
              <button
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                title="Help"
              >
                <QuestionMarkCircleIcon className="h-4 w-4" />
                Help
              </button>

              <button
                className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                title="Notifications"
              >
                <BellIcon className="h-5 w-5" />
              </button>

              {/* Profile menu */}
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-1.5 py-1 pr-2 shadow-sm hover:bg-slate-50">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold ring-1 ring-emerald-200">
                    {initials}
                  </span>
                  <span className="hidden md:inline text-sm font-medium max-w-[140px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-xl focus:outline-none z-[60]">
                    <div className="p-3">
                      <div className="flex items-center gap-3">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user?.name}
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full grid place-items-center bg-emerald-100 text-emerald-800 text-xs font-semibold ring-1 ring-emerald-200">
                            {initials}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-sm text-slate-800">
                            {user?.name}
                          </div>
                          <div className="text-xs text-slate-500">Student</div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-2 text-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Section</span>
                          <span className="font-medium">{user?.section}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Class</span>
                          <span className="font-medium">{user?.className}</span>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`w-full text-left px-3 py-2 rounded-lg border ${
                                active ? "bg-slate-50" : "bg-white"
                              } border-slate-200`}
                            >
                              Switch to Parent View
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`w-full text-left px-3 py-2 rounded-lg border ${
                                active ? "bg-slate-50" : "bg-white"
                              } border-slate-200`}
                            >
                              Settings
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`w-full text-left px-3 py-2 rounded-lg border ${
                                active ? "bg-red-50" : "bg-white"
                              } border-slate-200 text-red-600`}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        {/* Accent strip */}
        {/* Accent strip (single row: personas + Achievements) */}
        {showBadges && (
        <div className="bg-gradient-to-r from-emerald-50 via-amber-50 to-sky-50 border-t border-slate-200/70">
          <div className="mx-auto max-w-[1400px] px-4">
            <div
              className="
                flex items-center gap-2 py-2
                overflow-x-auto whitespace-nowrap
                [scrollbar-width:none] [-ms-overflow-style:none]
              "
              style={{ scrollbarWidth: "none" }}
            >
              {/* Personas */}
              {PERSONA_TAGS.map(tag => (
                <button
                  key={tag.label}
                  className="
                    shrink-0 inline-flex h-9 items-center gap-2
                    rounded-full border border-slate-200 bg-white
                    px-3 text-xs font-medium text-slate-700
                    shadow-sm hover:bg-slate-50
                  "
                  title={tag.label}
                >
                  <span className="text-base leading-none">{tag.emoji}</span>
                  {tag.label}
                </button>
              ))}

              {/* Divider dot */}
              <span className="mx-1 h-1 w-1 rounded-full bg-slate-300/60 shrink-0" />

              {/* Achievements label (inline, not a chip) */}
              {/* <span className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 tracking-wide">
                <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 21h8M12 17l-3 4h6l-3-4Zm7-13h2v4a3 3 0 0 1-3 3h-1l-2 2-2-2H8a3 3 0 0 1-3-3V4h2"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Achievements
              </span> */}

              {/* Achievements badges (same height as persona chips) */}
              {/* 🎯 Aarcher · Accuracy */}
              <span
                className="
                  shrink-0 inline-flex h-9 items-center gap-2
                  rounded-full border border-slate-200 bg-white
                  px-3 text-xs font-semibold text-slate-700
                  shadow-sm hover:bg-slate-50
                "
                title="Archer – Accuracy"
              >
                <span className="text-base leading-none">🎯</span>
                Archer · <span className="font-medium text-slate-600">Accuracy</span>
              </span>

              {/* 🏅 Marathon Runner · Consistency (medal + side tag but single height) */}
              <span
                className="
                  shrink-0 inline-flex h-9 items-center overflow-hidden
                  rounded-full border border-slate-200 bg-white shadow-sm
                "
                title="Marathon Runner – Consistency"
              >
                <span
                  className="
                    h-9 w-9 grid place-items-center
                    bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-100
                    ring-1 ring-amber-300 text-base
                  "
                >
                  🏅
                </span>
                <span className="px-3 text-xs font-semibold text-slate-700">
                  Marathon Runner · <span className="font-medium text-slate-600">Consistency</span>
                </span>
              </span>
            </div>
          </div>
        </div>)}

      </div>
    </header>
  );
}
