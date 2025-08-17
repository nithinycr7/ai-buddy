import React from "react";
import { StudentBadge } from "../../store/useAppStore";
import { cn } from "../../utils/cn";

interface BadgeProps {
  label: StudentBadge;
}

const Badge: React.FC<BadgeProps> = ({ label }) => {
  const badgeStyles: Record<StudentBadge, string> = {
    "Math Whiz": "bg-blue-100 text-blue-800 border border-blue-400",
    "Science Explorer": "bg-green-100 text-green-800 border border-green-400",
    "History Buff": "bg-yellow-100 text-yellow-800 border border-yellow-400",
    "Language Lover": "bg-purple-100 text-purple-800 border border-purple-400",
  };
  const badgeIcon: Record<StudentBadge, string> = {
    "Math Whiz": "🔢",
    "Science Explorer": "🔬",
    "History Buff": "📜",
    "Language Lover": "📚",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-xs font-medium rounded gap-2",
        badgeStyles[label]
      )}
    >
      <span className="text-base">{badgeIcon[label]}</span>
      {label}
    </span>
  );
};

export default Badge;
