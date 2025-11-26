"use client";

import Link from "next/link";
import { useState } from "react";
import { useTypewriter } from "./hooks/useTypewriter";
import { MemoryTimeline } from "./components/MemoryTimeline";
import ClearMemoryButton from "./components/ClearMemoryButton";
import AddPeople, { ALL_PERSONAS } from "./components/AddPeople";
import DebateDisplay from "./components/DebateDisplay";
import type { PersonaKey } from "../lib/trinity/persona/personas";
import { PERSONAS } from "../lib/trinity/persona/personas";
import {
  orchestrateMultiPersona,
  buildPersonaMetadata,
  type PersonaResponse,
} from "@/lib/multi-persona-orchestrator";

interface Message {
  type: "user" | "ai" | "debate";
  text: string;
  rawData?: Record<string, unknown>;
  timestamp: number;
  responses?: PersonaResponse[]; // For multi-persona debates
  totalLatency?: number;
}

export default function HarmonicChat() {
  const [persona, setPersona] = useState<PersonaKey>("alba");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAIText, setLastAIText] = useState("");
  const [showDebate, setShowDebate] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [activeParticipants, setActiveParticipants] = useState(["alba", "albi", "asi"]); // Default personas
  const [debateMode, setDebateMode] = useState(false); // Toggle between single and multi-persona

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

    // Add user message
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
      // Check if debate mode (multiple personas)
      if (debateMode && activeParticipants.length > 1) {
        // Multi-persona mode
        const personaMetadata = buildPersonaMetadata(
          activeParticipants,
          ALL_PERSONAS
        );

        const result = await orchestrateMultiPersona(
          userText,
          activeParticipants,
          personaMetadata,
          "default"
        );

        // Add debate message
        setMessages((m) => [
          ...m,
          {
            type: "debate",
            text: userText,
            responses: result.responses,
            totalLatency: result.totalLatency,
            timestamp: Date.now(),
          },
        ]);
      } else {
      // Single persona mode (legacy)
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
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";
      setMessages((m) => [
        ...m,
        {
          type: "ai",
          text: `❌ Gabim: ${errorMessage}`,
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Active Participants ({activeParticipants.length})</h3>
                {activeParticipants.length > 1 && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={debateMode}
                      onChange={(e) => setDebateMode(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="font-medium text-purple-700">
                      {debateMode ? "🎭 Debate Mode" : "💬 Single Mode"}
                    </span>
                  </label>
                )}
              </div>
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
                {debateMode
                  ? "🎭 All personas will respond simultaneously to your questions"
                  : "💡 Selected personas available. Toggle Debate Mode to activate multi-persona responses"}
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
        <div className="bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto p-4 space-y-4 mb-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-center">
                Nuk ka mesazhe akoma. <br />
                Fillo bisedën! 💬
              </p>
            </div>
          ) : (
              messages.map((m, i) => {
                if (m.type === "user") {
                  return (
                    <div key={i} className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs">
                        <p className="text-sm">{m.text}</p>
                      </div>
                    </div>
                  );
                } else if (m.type === "debate") {
                  // Multi-persona debate display
                  return (
                    <div key={i} className="w-full">
                      <DebateDisplay
                        userMessage={m.text}
                        responses={m.responses || []}
                        isLoading={loading && i === messages.length - 1}
                        totalLatency={m.totalLatency}
                      />
                    </div>
                  );
                } else {
                  // Single persona response
                  return (
                    <div key={i} className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-xs">
                        {/* Persona info */}
                        {m.rawData && typeof m.rawData === "object" && "debugSnapshot" in m.rawData && (
                          <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                            <span>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {(m.rawData as any).debugSnapshot?.persona?.emoji || "🤖"}{" "}
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              <strong>{(m.rawData as any).debugSnapshot?.persona?.name || "unknown"}</strong>
                            </span>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(m.rawData as any).debugSnapshot?.blended && (
                              <span>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                + blended {((m.rawData as any).debugSnapshot?.blended?.keys as string[])?.join(" & ") || ""}
                              </span>
                            )}
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(m.rawData as any).debugSnapshot?.mood && (
                              <span>
                                | 🎭{" "}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(m.rawData as any).debugSnapshot?.mood?.emotion || "calm"}
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
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {showDebate && m.rawData && typeof m.rawData === "object" && "toolsUsed" in m.rawData && Array.isArray((m.rawData as any).toolsUsed) && (m.rawData as any).toolsUsed.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-700">
                            <p className="font-medium">🔧 Tools used:</p>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {((m.rawData as any).toolsUsed as Array<Record<string, any>>).map((t, j) => (
                              <div key={j} className="ml-2 py-1">
                                <span className="font-mono text-gray-600">
                                  {t.name}: {t.output}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Debate info */}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {showDebate && m.rawData && typeof m.rawData === "object" && "debate" in m.rawData && (m.rawData as any).debate?.enabled && (
                          <div className="mt-2 pt-2 border-t border-gray-300 text-xs">
                            <p className="font-medium text-gray-700">🎭 Debate:</p>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {((m.rawData as any).debate?.turns || []).map((t: any, j: number) => {
                              const persona = t.persona as PersonaKey;
                              return (
                                <div key={j} className="ml-2 py-1">
                                  <p className="font-medium text-gray-700">
                                    {PERSONAS[persona]?.emoji} {persona} (⚖️ {t.weight?.toFixed(1) || '0'})
                                  </p>
                                  <p className="text-gray-600 italic">{t.text}</p>
                                </div>
                              );
                            })}
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(m.rawData as any).debate?.winner && (
                              <p className="mt-1 font-medium text-green-700">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                ✅ Winner: {(m.rawData as any).debate?.winner}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              })
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
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <MemoryTimeline messages={messages.filter((m) => m.type !== "debate") as any} />
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
