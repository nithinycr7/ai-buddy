import React from "react";
export default function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-soft ${className}`}>
      {title && <h3 className="font-semibold mb-2 header-hand">{title}</h3>}
      {children}
    </div>
  );
}
