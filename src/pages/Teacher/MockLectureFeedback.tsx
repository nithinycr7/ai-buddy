import Card from "../../components/UI/Card";

function Left() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl ">Mock Lecture</h2>
      <div className="relative bg-black aspect-video rounded-xl overflow-hidden shadow-soft taped"></div>
      <Card title="Transcript (live)">
        <div className="text-sm space-y-2">
          <p>
            <span className="text-slate-500">00:07</span> Today we explore quadratic functions…{" "}
            <span className="text-red-600">[clarify term]</span>
          </p>
          <p>
            <span className="text-slate-500">00:28</span> Vertex form helps identify the peak…{" "}
            <span className="text-red-600">[slow down]</span>
          </p>
        </div>
      </Card>
    </div>
  );
}

function Right() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl ">Live AI Feedback</h2>
      <div className="space-y-3">
        <div className="sticky">Slow down here 🐢</div>
        <div className="sticky -rotate-1">Clarify "axis of symmetry"</div>
        <div className="sticky rotate-1">Ask a check-for-understanding</div>
      </div>
    </div>
  );
}

export default { Left, Right };
