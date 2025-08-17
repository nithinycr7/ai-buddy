import React from "react";
import ProgressRing from "../../../../components/UI/ProgressRing";
import Card from "../../../../components/UI/Card";
import { ClassCard } from "../../../../store/useAppStore";

interface LectureCardProps {
  lectureData: ClassCard;
}

const LectureCard: React.FC<LectureCardProps> = ({ lectureData }) => {
  const { id, icon, title, topic, summary, progress } = lectureData;
  return (
    <Card key={id}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg">
            {icon} {title} — {topic}
          </div>
          <div className="text-sm text-slate-600 max-w-prose">{summary}</div>
          <div className="flex gap-2 mt-2">
            <a href="/student/replay" className="px-3 py-1.5 rounded-lg bg-pastelGreen">
              Revise
            </a>
            <a href="/student/quiz" className="px-3 py-1.5 rounded-lg bg-pastelYellow">
              Quiz
            </a>
          </div>
        </div>
        <div className="shrink-0">
          <ProgressRing value={progress} />
        </div>
      </div>
    </Card>
  );
};

export default LectureCard;
