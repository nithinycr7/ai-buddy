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
    "Photosynthesis is the process by which green plants use sunlight to synthesize foods from carbon dioxide and water. It generally involves the green pigment chlorophyll and generates oxygen as a byproduct."
  );
  const [_lang, _setLang] = useState<Lang>("en"); // reserved for future i18n if you want
  const [story, setStory] = useState("");

  // Generate story (replace with your API later)
  const handleGenerateStory = () => {
    const s = summary.trim();
    if (!s) return;
    setStory(
      `Once upon a sunny morning, a little green leaf woke up excited to make food.
Using sunlight as its magic wand, it mixed water from the roots with invisible carbon dioxide from the air.
Out came delicious sugar for the plant to grow — and a breath of fresh oxygen for the world.
That’s how photosynthesis became the leaf’s favorite daily adventure.`
    );
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
            <div className="relative">
              <textarea
                value={story}
                readOnly
                className="w-full h-36 md:h-40 resize-none border rounded-xl p-3 bg-slate-50 pr-10"
              />
              {/* Speaker button for story */}
              <SpeakButton text={story} ariaLabel="Listen to generated story" />
            </div>
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

/** Non-sticky chatbot panel (self-contained) */
function ChatPanel() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! Ask me about this lecture and I’ll help." },
  ]);
  const [input, setInput] = useState("");

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    // Fake AI – replace with your backend
    setTimeout(() => {
      setMessages(m => [
        ...m,
        { role: "ai", text: "Here’s a quick tip: focus on the key terms and definitions first." },
      ]);
    }, 300);
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
