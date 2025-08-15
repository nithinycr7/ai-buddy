import React from "react";
export default function SingleCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="page max-w-2xl w-full">{children}</div>
    </div>
  );
}
