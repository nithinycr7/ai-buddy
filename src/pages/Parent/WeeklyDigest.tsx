import Card from "../../components/UI/Card";

function Left() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl header-hand">Badges & Mastery</h2>
      <div className="grid grid-cols-3 gap-3">
        {["📘", "🧩", "🏅", "🔬", "🧠", "✍️"].map((b, i) => (
          <Card key={i} className="text-center text-3xl">
            {b}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Right() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl header-hand">At‑home Activities</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {[
          { icon: "📚", text: "Read 10 pages together" },
          { icon: "🧩", text: "Puzzle: 15 minutes" },
          { icon: "🧪", text: "Simple kitchen experiment" },
          { icon: "🗣️", text: "Explain a concept aloud" },
        ].map((a, i) => (
          <Card key={i} className="flex items-center gap-2">
            <span className="text-2xl">{a.icon}</span> <span>{a.text}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default { Left, Right };
