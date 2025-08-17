import React, { useState } from "react";

export default function AskAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");

  function send() {
    if (!input.trim()) return;
    setMessages(m => [...m, { role: "user", text: input }]);
    setTimeout(
      () =>
        setMessages(m => [
          ...m,
          { role: "ai", text: "Here's a helpful hint about your question ✨" },
        ]),
      300
    );
    setInput("");
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 right-4 md:right-6 bg-pastelYellow rounded-full px-4 py-2 shadow-soft border"
      >
        Ask AI 💬
      </button>
      {open && (
        <div className="fixed bottom-28 right-4 md:right-6 w-80 bg-white rounded-2xl shadow-soft p-3 border">
          <div className=" mb-2">Sticky Chat</div>
          <div className="h-56 overflow-auto space-y-2 mb-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm ${
                  m.role === "ai" ? "bg-pastelGreen" : "bg-pastelBlue"
                } rounded-xl px-3 py-2`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 border rounded-xl px-3 py-2"
              placeholder="Ask anything…"
            />
            <button onClick={send} className="px-3 py-2 rounded-xl bg-slate-800 text-white">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
