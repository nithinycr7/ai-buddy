// src/components/BottomNav.tsx
import { Fragment, useMemo } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useLocation, useNavigate } from "react-router-dom";

type NavItem =
  | { to: string; label: string; icon: string }
  | { key: string; label: string; icon: string };

const baseItems: NavItem[] = [
  { to: "/", label: "Today", icon: "🗓️" },
  { to: "/teacher", label: "Teacher", icon: "👩‍🏫" },
  { to: "/parent", label: "Parent", icon: "👨‍👩‍👧" },
  { to: "/administration", label: "Admin", icon: "👨" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isReplayPage =
    pathname === "/student/replay" || pathname.startsWith("/home");

  const items: NavItem[] = useMemo(
    () =>
      isReplayPage
        ? [{ key: "practice", label: "Let’s Practice the Quiz", icon: "🧠" }, ...baseItems]
        : baseItems,
    [isReplayPage]
  );

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Popover className="relative">
        {({ close }) => (
          <>
            {/* Center FAB button */}
            <Popover.Button
              className="rounded-full px-4 py-2 border border-slate-200 bg-white/90 backdrop-blur shadow-soft
                         text-slate-800 hover:bg-white flex items-center gap-2"
              aria-label="Open views"
            >
              <span>☰</span>
              <span className="font-medium">{isReplayPage ? "Actions" : "Views"}</span>
            </Popover.Button>

            {/* Centered panel above the button */}
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max origin-bottom
                           rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-soft p-1"
              >
                {items.map(it => {
                  // Type guard for 'to'
                  const isActive =
                    "to" in it ? pathname === it.to : false;
                  const key = "key" in it ? it.key : it.to ?? it.label;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if ("key" in it && it.key === "practice") navigate("/student/quiz");
                        else if ("to" in it && it.to) navigate(it.to);
                        close();
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-left hover:bg-slate-50
                                  ${isActive ? "bg-pastelBlue ring-2 ring-slate-700" : ""}`}
                    >
                      <span>{it.icon}</span>
                      <span>{it.label}</span>
                    </button>
                  );
                })}
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}
