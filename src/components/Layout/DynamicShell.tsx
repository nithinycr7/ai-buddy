import React from "react";
import { useAppStore } from "../../store/useAppStore";
import Badge from "../UI/Badge";

export default function DynamicShell({
  left,
  right,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
}) {
  const user = useAppStore(state => state.user);
  return (
    <div className="notebook grid grid-cols-1 md:grid-cols-10 gap-3 md:gap-4 max-w-[1280px] mx-auto">
      {user?.name && (
        <div className="flex gap-4 items-center col-span-10">
          <h1 className="text-2xl">Hi {user.name}</h1>
          {!!user?.badges?.length &&
            user.badges.map((badge, index) => {
              return <Badge label={badge} key={index} />;
            })}
        </div>
      )}
      <section className="relative col-span-6">{left}</section>
      <aside className="relative page hidden md:block col-span-4">{right}</aside>
    </div>
  );
}
