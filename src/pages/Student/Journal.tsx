import Tabs from "../../components/UI/Tabs";
import Card from "../../components/UI/Card";
import { useState } from "react";

const SUBJECTS = [
  { id: "math", label: "Math" },
  { id: "sci", label: "Science" },
  { id: "his", label: "History" },
  { id: "eng", label: "English" },
];

function Left() {
  const [active, setActive] = useState("sci");
  return (
    <div className="space-y-4">
      <h2 className="text-2xl header-hand">Learning Journal</h2>
      <Tabs tabs={SUBJECTS} active={active} onChange={setActive} />
      <div className="mt-2">
        <input placeholder="Search notes…" className="w-full border rounded-xl px-3 py-2" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <div className="header-hand-2 text-lg">Highlighted Notes #{i}</div>
            <p className="text-sm text-slate-700">
              Hand-drawn highlights, inline sketches, and bookmark stickers…
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Right() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl header-hand">Reminders & Bookmarks</h2>
      <div className="space-y-3">
        <div className="sticky">Finish lab write-up by Friday</div>
        <div className="sticky -rotate-2">Bring graph notebook 📈</div>
      </div>
    </div>
  );
}

export default { Left, Right };
