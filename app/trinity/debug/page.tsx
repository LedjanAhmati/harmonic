"use client";
import { useState } from "react";
import ClearMemoryButton from "../../components/ClearMemoryButton";

type MemoryEntry = {
  type: string;
  content: string;
  timestamp: string;
};

export default function TrinityDebug() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!sessionId) {
      setError("Please enter a Session ID.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessages([]);
    try {
      const res = await fetch("/api/trinity/memory?sessionId=" + sessionId);
      if (!res.ok) {
        throw new Error(`Failed to fetch memory: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      // The API returns { sessionId: "...", memory: [...] }
      // We need to access the 'memory' property
      if (data.memory && Array.isArray(data.memory)) {
        setMessages(data.memory);
      } else {
        // If the response is not as expected, handle it gracefully
        console.warn("Unexpected API response structure:", data);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            🧠 Trinity — Internal Mind Viewer
          </h1>
          <p className="text-gray-500">
            Inspect the memory stream of a specific session.
          </p>
        </header>

        <div className="flex items-center gap-2 mb-6">
          <input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter Session ID"
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <button
            onClick={load}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading || !sessionId}
          >
            {loading ? "Loading..." : "Load Session"}
          </button>
          {sessionId && (
            <ClearMemoryButton
              sessionId={sessionId}
              onCleared={() => setMessages([])}
            />
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 space-y-6">
            {messages.length > 0 ? (
              messages.map((m: MemoryEntry, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${m.type === "user_prompt"
                      ? "bg-blue-50 border-l-4 border-blue-400"
                      : "bg-gray-50 border-l-4 border-gray-400"
                    }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`font-semibold text-sm uppercase ${m.type === "user_prompt"
                          ? "text-blue-800"
                          : "text-gray-800"
                        }`}
                    >
                      {m.type.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
              ))
            ) : (
              !loading && (
                <div className="text-center py-10 text-gray-500">
                  <p>No messages to display. Enter a Session ID and click &quot;Load Session&quot;.</p>
                </div>
              )
            )}
            {loading && (
              <div className="text-center py-10 text-gray-500">
                <p>Loading memory...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
