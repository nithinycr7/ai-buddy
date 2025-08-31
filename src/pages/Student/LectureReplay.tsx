import { useRef, useState } from "react";
import Card from "../../components/UI/Card";

type Lang = "en" | "hi" | "te";

/** Small reusable speaker button that reads out the provided text. */
function SpeakButton({ text, ariaLabel = "Listen to text" }: { text: string; ariaLabel?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const toggleSpeak = () => {
    const synth = window.speechSynthesis;
    if (!synth || !text?.trim()) return;

    // If already speaking, stop.
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    // Create a new utterance and speak.
    const u = new SpeechSynthesisUtterance(text);
    // Tweak these if you want per-language voices
    u.lang = "en-IN"; // pick a default; you can change based on user locale or selected language
    u.rate = 1;
    u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);

    utterRef.current = u;
    setSpeaking(true);
    synth.cancel(); // cancel any previous speech
    synth.speak(u);
  };

  return (
    <button
      type="button"
      onClick={toggleSpeak}
      aria-label={ariaLabel}
      className="absolute top-2 right-2 rounded-full border bg-white/90 px-2 py-1 text-lg leading-none shadow-soft hover:bg-white"
      title={speaking ? "Stop" : "Listen"}
    >
      {speaking ? "⏹️" : "🔊"}
    </button>
  );
}

function Left() {
  const [summary, setSummary] = useState(
    `Definition:
Photosynthesis is the process by which green plants, algae, and some bacteria use energy from sunlight to make their own food. Using carbon dioxide (CO₂) from the air and water (H₂O) from the soil, plants produce glucose (a type of sugar), which is their source of energy. This process takes place mainly in the chloroplasts of plant cells, where the green pigment chlorophyll captures sunlight. As a byproduct, oxygen (O₂) is released into the air, which is essential for animals and humans to breathe.

The General Equation:
6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
(Carbon dioxide + Water → Glucose + Oxygen)

Key Steps:
- Light Absorption: Chlorophyll absorbs sunlight in the leaves.
- Water Splitting: Water absorbed by roots is split into hydrogen and oxygen using light energy. Oxygen is released into the air.
- Carbon Fixation: Carbon dioxide from the atmosphere enters the leaves through stomata.
- Glucose Formation: Hydrogen from water and carbon from carbon dioxide combine to form glucose.

Importance of Photosynthesis:
- Produces oxygen, which all living organisms need for respiration.
- Provides food (glucose) for plants and indirectly for animals and humans.
- Forms the base of the food chain.
- Helps regulate atmospheric CO₂ levels.

Examples & Analogies:
- Photosynthesis is like plants being “solar panels” that convert sunlight into usable energy.
- Just as humans eat food for energy, plants make their own food using sunlight.
- Forests are often called the “lungs of the Earth” because they release large amounts of oxygen through photosynthesis.`
  );
  const [_lang, _setLang] = useState<Lang>("en"); // reserved for future i18n if you want
  const [story, setStory] = useState("");

  // Generate story (replace with your API later)
  const handleGenerateStory = () => {
    const s = summary.trim();
    if (!s) return;
    setStory(
      `“Captain Chlorophyll vs. The Carbon Dioxide Army”

In the city of Greenopolis, danger was rising.
The Carbon Dioxide Army (CO₂) was filling the skies, making it hard for people to breathe.

Just when things looked hopeless, a hero appeared:
✨ Captain Chlorophyll – the green guardian of the plants!

Captain Chlorophyll had a solar-powered suit that could capture sunlight.
With his special powers, he shouted:
“Time to turn sunlight into energy!” 🌞

He absorbed sunlight with his glowing green shield.

His plant allies pulled up water from the ground, splitting it into oxygen and hydrogen.

Captain Chlorophyll captured the CO₂ villains from the air through his stomata portals.

Combining hydrogen + carbon, he created glucose fuel to keep the city’s plants strong.

With a mighty blast 💥 he released oxygen into the sky, driving the CO₂ Army away and filling the air with fresh breath for humans and animals.

The people cheered:
“Captain Chlorophyll saved us! 🌍 He is the reason Earth can breathe!”

And Captain Chlorophyll smiled,
“Every green leaf is a hero. Together, we keep the planet alive.”`
    );
  };
  const [open, setOpen] = useState(false);

  const copyStory = async () => {
    try {
      await navigator.clipboard.writeText(story);
    } catch {}
  };

  const downloadStory = () => {
    const blob = new Blob([story], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-story.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl ">Lecture Summary</h2>

      <Card title="Class Summary">
        <div className="relative">
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            className="w-full h-48 md:h-60 resize-y border rounded-xl p-3 leading-6 pr-10"
            placeholder="Class summary will appear here…"
          />
          {/* Speaker button for summary */}
          <SpeakButton text={summary} ariaLabel="Listen to class summary" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateStory}
            className="px-4 py-2 rounded-xl bg-pastelGreen border shadow-soft hover:bg-emerald-100"
          >
            Generate Story
          </button>
        </div>

        {story && (
          <div className="mt-3">
            <label className="block text-sm text-slate-600 mb-1">Generated Story</label>

            {/* Compact inline reader (better than textarea for read-only) */}
            <div className="relative">
              <div className="w-full min-h-[14rem] max-h-[50vh] overflow-auto border rounded-xl p-3 bg-slate-50 whitespace-pre-wrap leading-7 pr-10">
                {story}
              </div>

              {/* Speaker button for inline story */}
              <SpeakButton text={story} ariaLabel="Listen to generated story" />
            </div>

            {/* Actions */}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setOpen(true)}
                className="px-3 py-1.5 rounded-lg border shadow-soft bg-white hover:bg-slate-50"
              >
                Open Fullscreen
              </button>
              <button
                onClick={copyStory}
                className="px-3 py-1.5 rounded-lg border shadow-soft bg-white hover:bg-slate-50"
              >
                Copy
              </button>
              <button
                onClick={downloadStory}
                className="px-3 py-1.5 rounded-lg border shadow-soft bg-white hover:bg-slate-50"
              >
                Download .txt
              </button>
            </div>

            {/* Fullscreen modal */}
            {open && (
              <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex"
                role="dialog"
                aria-modal="true"
                aria-labelledby="story-title"
                onClick={e => {
                  if (e.target === e.currentTarget) setOpen(false); // click backdrop to close
                }}
              >
                <div className="m-auto w-[min(900px,95vw)] h-[80vh] rounded-2xl bg-white p-4 shadow-soft flex flex-col">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 id="story-title" className="text-lg font-semibold">
                      Generated Story
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={copyStory}
                        className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50"
                      >
                        Copy
                      </button>
                      <button
                        onClick={downloadStory}
                        className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => setOpen(false)}
                        className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="relative flex-1 overflow-auto border rounded-xl p-4 bg-slate-50 whitespace-pre-wrap leading-7 overscroll-contain">
                    {story}
                    {/* Speaker in fullscreen too */}
                    <SpeakButton text={story} ariaLabel="Listen to generated story" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function Right() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl ">Chat</h2>
      <ChatPanel />
    </div>
  );
}
function toApiMessages(uiMsgs: { role: "user" | "ai"; text: string }[]) {
  return uiMsgs.map(m => ({
    role: m.role === "ai" ? "assistant" : "user",
    content: m.text,
  }));
}

/** Non-sticky chatbot panel (self-contained) */
function ChatPanel() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! Ask me about this lecture and I’ll help." },
  ]);
  const [input, setInput] = useState("");

  const API_BASE = "https://aibuddy-be-awb3eqfyftc7cbe6.canadacentral-01.azurewebsites.net";

const send = async () => {
  const text = input.trim();
  if (!text) return;

  // 1) Optimistically add the user message
  setMessages(m => [...m, { role: "user", text }]);
  setInput("");

  try {
    // 2) Build the payload (stateless: send only the last user turn; or send full history)
    const payload = {
      messages: [{ role: "user", content: text }],
      // Optional: if you later pass the lecture summary down as a prop, include it here:
      // summary,
      temperature: 0.2,
      max_tokens: 300,
    };

    console.log("Payload:", payload,`${API_BASE}/api/ai/chat`,"hh");

    // 3) Call backend
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} ${detail}`);
    }

    // 4) Append assistant reply
    const data: { reply: string } = await res.json();
    setMessages(m => [...m, { role: "ai", text: data.reply || "…" }]);
  } catch (err: any) {
    setMessages(m => [
      ...m,
      { role: "ai", text: `Sorry, I couldn’t reply right now. (${err?.message || "error"})` },
    ]);
  }
};


  return (
    <Card>
      <div className="flex flex-col h-[60vh]">
        <div className="flex-1 overflow-auto space-y-2 pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "ai" ? "bg-pastelGreen" : "bg-pastelBlue ml-auto"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            className="flex-1 border rounded-xl px-3 py-2"
            placeholder="Type your message…"
          />
          <button
            onClick={send}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white shadow-soft"
          >
            Send
          </button>
        </div>
      </div>
    </Card>
  );
}
export default { Left, Right };
