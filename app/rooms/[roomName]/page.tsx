"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";
import { AGENTS } from "@/lib/agents";
import Link from "next/link";

type TokenResponse = {
  token: string;
  serverUrl: string;
};

type AgentSpawnResponse = {
  ok: boolean;
  token: string;
  identity: string;
  agent: {
    id: string;
    name: string;
    role: string;
  };
};

export default function RoomPage() {
  const params = useParams<{ roomName: string }>();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activatingAgentId, setActivatingAgentId] = useState<string | null>(
    null
  );
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);

  const roomName = decodeURIComponent(params.roomName);
  const username = searchParams.get("name") || "Guest";

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/livekit-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName,
            identity: username,
            metadata: { role: "user" },
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to get token");
        }

        const data: TokenResponse = await res.json();
        setToken(data.token);
        setServerUrl(data.serverUrl);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Connection failed";
        setError(errorMessage);
      } finally {
        setIsConnecting(false);
      }
    }

    fetchToken();
  }, [roomName, username]);

  async function toggleAgent(agentId: string) {
    const isActive = activeAgents.includes(agentId);

    if (!isActive) {
      setActivatingAgentId(agentId);
      try {
        const res = await fetch("/api/spawn-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName,
            agentId,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to spawn agent");
        }

        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        const data: AgentSpawnResponse = await res.json();
        setActiveAgents((prev) => [...prev, agentId]);
      } catch (err: unknown) {
        console.error(err);
        // TODO: Show toast error
      } finally {
        setActivatingAgentId(null);
      }
    } else {
      setActiveAgents((prev) => prev.filter((id) => id !== agentId));
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="max-w-md space-y-4 text-center">
          <div className="text-red-400 text-lg font-semibold">❌ Error</div>
          <p className="text-slate-400">{error}</p>
          <Link
            href="/rooms"
            className="inline-block px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
          >
            Back to Lobby
          </Link>
        </div>
      </main>
    );
  }

  if (isConnecting || !token || !serverUrl) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-3">
          <div className="text-3xl">🔄</div>
          <p className="text-slate-400">Connecting to room...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Video Conference Area */}
      <section className="flex-1 relative">
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          video={true}
          audio={true}
          data-lk-theme="default"
          style={{ height: "100vh", width: "100%" }}
        >
          <VideoConference />
        </LiveKitRoom>

        {/* Room Info Badge */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur rounded-lg px-4 py-2 border border-slate-700">
          <p className="text-xs text-slate-400">Room:</p>
          <p className="text-sm font-semibold text-slate-100">{roomName}</p>
          <p className="text-xs text-slate-400 mt-1">📍 {username}</p>
        </div>

        {/* Back Button */}
        <Link
          href="/rooms"
          className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition border border-slate-700"
        >
          ← Back
        </Link>
      </section>

      {/* Agents Panel */}
      <aside className="w-80 border-l border-slate-800 bg-slate-900/60 backdrop-blur flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
            🤖 AI Personas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Zgjidh cilët agjentë dëshiron në këtë room
          </p>
        </div>

        {/* Agents List */}
        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {AGENTS.map((agent) => {
            const isActive = activeAgents.includes(agent.id);
            const isLoading = activatingAgentId === agent.id;

            return (
              <div
                key={agent.id}
                className="rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 space-y-2 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-100">
                      {agent.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {agent.description}
                    </p>
                  </div>
                </div>
                <button
                  disabled={isLoading}
                  onClick={() => toggleAgent(agent.id)}
                  className={`w-full rounded-lg py-2 text-xs font-medium transition ${
                    isActive
                      ? "bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-800"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isLoading
                    ? "⏳ Activating..."
                    : isActive
                    ? "✓ Remove"
                    : "+ Add"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Active Count */}
        {activeAgents.length > 0 && (
          <div className="border-t border-slate-800 p-4 bg-slate-900/40">
            <p className="text-xs text-slate-400">
              {activeAgents.length} agent{activeAgents.length !== 1 ? "s" : ""}{" "}
              active in room
            </p>
          </div>
        )}
      </aside>
    </main>
  );
}
