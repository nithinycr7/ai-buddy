import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { cn } from "../../utils/cn";
import LectureCard from "./components/LectureCard/LectureCard";

const SubjectPage: React.FC = () => {
  const { subject: rawSubject } = useParams();
  const subject = useMemo(() => (rawSubject ? decodeURIComponent(rawSubject) : ""), [rawSubject]);

  const topicsBySubject = useAppStore(s => s.topicsBySubject);
  const allClasses = useAppStore(s => s.classes);

  const topics = topicsBySubject(subject);
  const [selected, setSelected] = useState<string | null>("all");
  const [classesForTopic, setClassesForTopic] = useState<any[]>([]);

  useEffect(() => {
    // when subject changes, reset selection to "all"
    setSelected("all");
  }, [subject, topics]);

  useEffect(() => {
    if (!selected || selected === "all") {
      // show incomplete revisions across all topics for this subject
      const incomplete = allClasses.filter(c => c.title === subject && c.progress < 0.8);
      setClassesForTopic(incomplete);
    } else {
      const filtered = allClasses.filter(c => c.topic === selected && c.title === subject);
      setClassesForTopic(filtered);
    }
  }, [selected, subject, allClasses]);

  const ListItem = ({ topic }: { topic: string }) => {
    return (
      <li>
        <button
          onClick={() => setSelected(topic)}
          className={cn(
            "w-full text-left px-2 py-3 rounded hover:bg-slate-50 transition-colors",
            selected === topic && "bg-pastelGreen/20 font-semibold"
          )}
        >
          {topic == "all" ? "Incomplete Revisions" : topic}
        </button>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top header */}
      <div className="border rounded-lg bg-white p-6">
        <h1 className="text-3xl font-extrabold">{subject || "Subject"}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        {/* Left column: navigation/list */}
        <div className="col-span-3 border rounded-lg bg-white p-6 h-full">
          <ul className="space-y-4">
            <ListItem topic="all" />

            {topics && topics.length > 0 ? (
              topics.map(topic => <ListItem key={topic} topic={topic} />)
            ) : (
              <li className="text-sm text-slate-500">No topics found for this subject.</li>
            )}
          </ul>
        </div>

        {/* Right column: details */}
        <div className="md:col-span-7 rounded-lg bg-white p-6 min-h-[420px] border">
          <div className="space-y-4">
            <div className="text-lg font-medium">
              {selected === "all" ? "Incomplete Revisions" : selected}
            </div>

            {classesForTopic && classesForTopic.length > 0 ? (
              <div className="space-y-4">
                {classesForTopic.map(c => (
                  <LectureCard key={c.id} lectureData={c} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-600">No classes found for this selection.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;
