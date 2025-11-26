"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RoomsLobbyPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName || !username) return;

    setLoading(true);
    const room = roomName.trim().toLowerCase();
    const user = username.trim();
    router.push(
      `/rooms/${encodeURIComponent(room)}?name=${encodeURIComponent(user)}`
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl border border-slate-700 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            🎼 Harmonic Rooms
          </h1>
          <p className="text-sm text-slate-400">
            Join a video room & chat with AI personas
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">
              Room Name
            </label>
            <input
              className="w-full rounded-lg bg-slate-800 px-4 py-3 text-sm text-white outline-none border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="p.sh. harmonic-support"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">
              Your Name
            </label>
            <input
              className="w-full rounded-lg bg-slate-800 px-4 py-3 text-sm text-white outline-none border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="p.sh. Ardit"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !roomName || !username}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "🔄 Connecting..." : "Join Room"}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-700">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-300 transition"
          >
            ← Back to Chat
          </Link>
        </div>
      </div>
    </main>
  );
}
