"use client";
import { useState } from "react";

export default function TrinityDebug() {
  const [sessionId, setSessionId] = useState("");
  type TrinityMessage = {
    id: string;
    role: string;
    content: string;
    ageim?: any;
    agents?: any;
  };
  const [messages, setMessages] = useState<TrinityMessage[]>([]);

  async function load() {
    const res = await fetch("/api/trinity/memory?sessionId=" + sessionId);
    const data = await res.json();
    setMessages(data.messages);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🧠 Trinity — Internal Mind Viewer</h1>
      <input
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        placeholder="Session ID"
        className="border p-2"
      />
      <button onClick={load} className="ml-2 p-2 border">
        Load
      </button>

      <div className="mt-6 space-y-4">
        {messages.map((m: TrinityMessage) => (
          <div key={m.id} className="p-4 border rounded bg-gray-50">
            <div><strong>{m.role.toUpperCase()}</strong></div>
            <pre className="whitespace-pre-wrap">{m.content}</pre>

            {m.ageim && (
              <details className="mt-2">
                <summary>AGEIM Decision</summary>
                <pre>{JSON.stringify(m.ageim, null, 2)}</pre>
              </details>
            )}

            {m.agents && (
              <details className="mt-2">
                <summary>Agents View</summary>
                <pre>{JSON.stringify(m.agents, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
