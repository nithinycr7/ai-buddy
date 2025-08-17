import React from "react";

export default function TwoPageShell({
  left,
  right,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="notebook grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-[1280px] mx-auto">
      <section className="relative page">{left}</section>
      <aside className="relative page hidden md:block">{right}</aside>
    </div>
  );
}
