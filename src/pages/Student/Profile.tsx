import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/UI/Card";
import { patchStudentPersona } from "../../api/students";

const TONES = ["Funny", "Adventurous", "Mystery", "Serious", "Inspirational"];
const THEMES = [
  "Space",
  "Animals",
  "Sports",
  "Superheroes",
  "Mythology",
  "Technology",
  "Art",
  "Nature",
  "Music",
  "History",
];
const DIFFICULTIES = ["Easy", "Balanced", "Challenging"];
const FORMATS = ["Short", "Long", "Comic-style", "Real-life Example", "Dialogue"];
const ROLES = [
  "Kid Hero",
  "Teacher Guide",
  "Animal Character",
  "Superhero",
  "Scientist",
  "Explorer",
];

export default function Profile() {
  const navigate = useNavigate();
  const [tone, setTone] = useState("Adventurous");
  const [themes, setThemes] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("Balanced");
  const [format, setFormat] = useState("Comic-style");
  const [role, setRole] = useState("Explorer");

  function toggleTheme(theme: string) {
    setThemes(prev => (prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]));
  }

  function save() {
    const studentId = "stu_12345"; // adjust based on your store

    if (!studentId) {
      console.error("No student_id found in store");
      return;
    }

    const persona = {
      story_tone: tone,
      themes,
      difficulty,
      format,
      character_role: role,
    };

    patchStudentPersona(studentId, persona)
      .then(updatedStudent => {
        console.log("Persona saved ✅", updatedStudent);
        // cache locally too if needed
        localStorage.setItem("student_persona", JSON.stringify(persona));
        alert("Your story profile has been updated successfully!");
        // back to previous page
      })
      .catch(err => {
        console.error("❌ Failed to save persona", err);
        alert("Could not save profile, please try again.");
      });
  }

  return (
    <div className="mt-20 mx-auto max-w-2xl space-y-6 p-4">
      <h2 className="text-2xl font-bold">Your Story Profile</h2>
      <p className="text-slate-600 text-sm">
        Choose how you like your stories. We’ll use this to explain topics in your style.
      </p>

      <Card title="Story Tone">
        <select
          value={tone}
          onChange={e => setTone(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
        >
          {TONES.map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Card>

      <Card title="Themes / Interests">
        <div className="flex flex-wrap gap-2">
          {THEMES.map(th => (
            <button
              key={th}
              onClick={() => toggleTheme(th)}
              className={`px-3 py-1 rounded-full border text-sm ${
                themes.includes(th)
                  ? "bg-emerald-100 border-emerald-300"
                  : "bg-white border-slate-200"
              }`}
            >
              {th}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Difficulty Level">
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
        >
          {DIFFICULTIES.map(d => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Card>

      <Card title="Story Format">
        <select
          value={format}
          onChange={e => setFormat(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
        >
          {FORMATS.map(f => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </Card>

      <Card title="Character Role">
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
        >
          {ROLES.map(r => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={save}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white shadow-soft hover:bg-indigo-500"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}
