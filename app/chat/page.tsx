"use client";
import { useState } from "react";

export default function ChatRoom() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);

  async function send() {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({prompt: input}),
    });
    const data = await res.json();
    setMessages(msgs => [...msgs, {role: "user", content: input}, {role: "ai", content: data.reply}]);
    setInput("");
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Trinity Chat Room</h1>
      <div className="mb-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className={m.role === "user" ? "font-bold text-blue-600" : "font-bold text-green-600"}>
              {m.role === "user" ? "Ti:" : "Trinity:"}
            </span>
            <span className="ml-2">{m.content}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border p-2 flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Shkruaj mesazhin..."
        />
        <button onClick={send} className="bg-black text-white px-4 py-2 rounded">Dërgo</button>
      </div>
    </div>
  );
}
