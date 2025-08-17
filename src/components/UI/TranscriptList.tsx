import React, { useState } from "react";

const sample = [
  { t: "00:01", text: "Welcome to photosynthesis basics." },
  { t: "00:24", text: "Chlorophyll captures light energy." },
  { t: "01:15", text: "CO₂ and water become glucose and oxygen." },
];

export default function TranscriptList() {
  const [highlight, setHighlight] = useState<string | null>(null);
  return (
    <div className="h-[55vh] overflow-auto space-y-2 pr-1">
      {sample.map((line, idx) => (
        <div
          key={idx}
          onClick={() => setHighlight(line.t)}
          className={`cursor-pointer rounded-lg px-3 py-2 ${
            highlight === line.t ? "bg-pastelBlue" : "hover:bg-slate-50"
          }`}
        >
          <div className="text-xs text-slate-500">{line.t}</div>
          <div className="text-sm">{line.text}</div>
        </div>
      ))}
    </div>
  );
}
