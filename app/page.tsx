"use client";

import Link from "next/link";
import { useState } from "react";
import { useTypewriter } from "./hooks/useTypewriter";
import { MemoryTimeline } from "./components/MemoryTimeline";
import ClearMemoryButton from "./components/ClearMemoryButton";
import AddPeople, { ALL_PERSONAS } from "./components/AddPeople";
import type { PersonaKey } from "../lib/trinity/persona/personas";
import { PERSONAS } from "../lib/trinity/persona/personas";

interface Message {
  type: "user" | "ai";
  text: string;
  rawData?: any;
  timestamp: number;
}

export default function HarmonicChat() {
  const [persona, setPersona] = useState<PersonaKey>("alba");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAIText, setLastAIText] = useState("");
  const [showDebate, setShowDebate] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [activeParticipants, setActiveParticipants] = useState<string[]>(["alba", "albi", "asi"]); // Default personas

  const typedAI = useTypewriter(lastAIText, 12); // Typing effect

  function addParticipant(personaId: string) {
    if (!activeParticipants.includes(personaId)) {
      setActiveParticipants([...activeParticipants, personaId]);
    }
  }

  function removeParticipant(personaId: string) {
    setActiveParticipants(activeParticipants.filter((p) => p !== personaId));
  }

  async function send() {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setLastAIText("");

    // Shto user message
    setMessages((m) => [
      ...m,
      {
        type: "user",
        text: userText,
        timestamp: Date.now(),
      },
    ]);

    setLoading(true);

    try {
      const res = await fetch("/api/think", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userText,
          persona,
          threadId: "default",
        }),
      });

      const data = await res.json();

      setLastAIText(data.text);
      setMessages((m) => [
        ...m,
        {
          type: "ai",
          text: data.text,
          rawData: data,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        {
          type: "ai",
          text: `❌ Gabim: ${err.message}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const lastMessage = messages[messages.length - 1];
  const isShowingTyping =
    lastMessage?.type === "ai" && lastMessage?.rawData && typedAI !== lastAIText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🎼 Harmonic Trinity
          </h1>
          <p className="text-gray-600">Multi-agent intelligence, real-time debate, memory threading</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Persona:</label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as PersonaKey)}
                className="px-3 py-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(PERSONAS).map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.emoji} {p.name}
                  </option>
                ))}
              </select>
            </div>
            <ClearMemoryButton
              sessionId="harmonic-trinity"
              onCleared={() => setMessages([])}
            />
          </div>

          {/* Add People Component */}
          <AddPeople onAdd={addParticipant} disabled={loading} />

          {/* Active Participants Display */}
          {activeParticipants.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Active Participants ({activeParticipants.length})</h3>
              <div className="flex flex-wrap gap-2">
                {activeParticipants.map((id) => {
                  const p = ALL_PERSONAS.find((x) => x.id === id);
                  return (
                    <div
                      key={id}
                      className="px-3 py-1 bg-white border border-purple-300 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <span>{p?.emoji}</span>
                      <span>{p?.name}</span>
                      <button
                        onClick={() => removeParticipant(id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                        title="Remove participant"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 Tip: These {activeParticipants.length} personas will participate in debates and multi-perspective analysis
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pyetje, ide, tekst për analizë..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "🔄" : "Send"}
            </button>
          </div>

          {/* Debug toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showDebate}
              onChange={(e) => setShowDebate(e.target.checked)}
              className="w-4 h-4"
            />
            Shfaq debate & tools
          </label>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-lg h-96 overflow-y-auto p-4 space-y-4 mb-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-center">
                Nuk ka mesazhe akoma. <br />
                Fillo bisedën! 💬
              </p>
            </div>
          ) : (
            messages.map((m, i) =>
              m.type === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs">
                    <p className="text-sm">{m.text}</p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-xs">
                    {/* Persona info */}
                    {m.rawData?.debugSnapshot && (
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <span>
                          {m.rawData.debugSnapshot.persona.emoji}{" "}
                          <strong>{m.rawData.debugSnapshot.persona.name}</strong>
                        </span>
                        {m.rawData.debugSnapshot.blended && (
                          <span>
                            + blended {m.rawData.debugSnapshot.blended.keys.join(" & ")}
                          </span>
                        )}
                        {m.rawData.debugSnapshot.mood && (
                          <span>
                            | 🎭{" "}
                            {m.rawData.debugSnapshot.mood.emotion || "calm"}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Main text (with typing effect for last message) */}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {i === messages.length - 1 && isShowingTyping
                        ? typedAI
                        : m.text}
                    </p>

                    {/* Tools output */}
                    {showDebate && m.rawData?.toolsUsed && m.rawData.toolsUsed.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-700">
                        <p className="font-medium">🔧 Tools used:</p>
                        {m.rawData.toolsUsed.map((t: any, j: number) => (
                          <div key={j} className="ml-2 py-1">
                            <span className="font-mono text-gray-600">
                              {t.name}: {t.output}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Debate info */}
                    {showDebate && m.rawData?.debate?.enabled && (
                      <div className="mt-2 pt-2 border-t border-gray-300 text-xs">
                        <p className="font-medium text-gray-700">🎭 Debate:</p>
                        {m.rawData.debate.turns?.map((t: any, j: number) => {
                          const persona = t.persona as PersonaKey;
                          return (
                          <div key={j} className="ml-2 py-1">
                            <p className="font-medium text-gray-700">
                              {PERSONAS[persona]?.emoji} {persona} (⚖️ {t.weight?.toFixed(1) || '0'})
                            </p>
                            <p className="text-gray-600 italic">{t.text}</p>
                          </div>
                        )})}
                        {m.rawData.debate.winner && (
                          <p className="mt-1 font-medium text-green-700">
                            ✅ Winner: {m.rawData.debate.winner}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            )
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="text-gray-500 italic">Trinity po mendon… ⏳</div>
            </div>
          )}
        </div>

        {/* Memory Timeline */}
        {messages.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2"
            >
              {showTimeline ? "▼" : "▶"} Memory Timeline
            </button>

            {showTimeline && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <MemoryTimeline messages={messages} />
              </div>
            )}
          </div>
        )}

        {/* Footer links */}
        <div className="flex gap-2 justify-center text-sm">
          <Link
            href="/lab"
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            🧪 Lab
          </Link>
          <Link
            href="/harmonic/dashboard"
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/trinity/debug"
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            🧠 Debug
          </Link>
        </div>
      </div>
    </div>
  );
}
