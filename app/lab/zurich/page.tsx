"use client";

import { useState, FormEvent } from "react";

interface ZurichDebug {
  intake?: any;
  pre?: any;
  tags?: any;
  interpretation?: any;
  reasoning?: any;
  strategy?: any;
  draft?: any;
}

interface ZurichResponse {
  ok: boolean;
  final?: string;
  debug?: ZurichDebug;
  cycle?: string;
  error?: string;
}

export default function LabZurichPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ZurichResponse | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/zurich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data: ZurichResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            ⚙️ Zürich Engine
          </h1>
          <p className="text-blue-300 text-lg">
            Deterministic reasoning without AI (100% local)
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="mb-8 bg-slate-800 rounded-lg p-6 border border-blue-500/30">
          <div className="flex flex-col gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything... (English or Albanian)"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded border border-blue-500/50 focus:outline-none focus:border-blue-400 min-h-24"
              disabled={loading}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition disabled:opacity-50"
              >
                {loading ? "Processing..." : "Analyze"}
              </button>
              <label className="flex items-center gap-2 text-blue-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDebug}
                  onChange={(e) => setShowDebug(e.target.checked)}
                  disabled={loading}
                />
                Show debug
              </label>
            </div>
          </div>
        </form>

        {/* Response */}
        {response && (
          <div className="space-y-6">
            {response.ok && response.final && (
              <div className="bg-slate-800 rounded-lg p-6 border border-blue-500/30">
                <h2 className="text-xl font-bold text-blue-300 mb-4">Response</h2>
                <div className="text-slate-100 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {response.final}
                </div>
              </div>
            )}

            {!response.ok && (
              <div className="bg-red-900/30 rounded-lg p-6 border border-red-500/50">
                <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
                <p className="text-slate-100">{response.error}</p>
              </div>
            )}

            {/* Debug Info */}
            {showDebug && response.debug && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-600/50">
                <h2 className="text-xl font-bold text-slate-300 mb-4">🔍 Debug Cycle</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(response.debug).map(([key, value]) => (
                    <div key={key} className="bg-slate-700 rounded p-4">
                      <h3 className="font-mono text-sm font-bold text-cyan-400 mb-2">
                        {key.toUpperCase()}
                      </h3>
                      <pre className="text-xs text-slate-300 overflow-auto max-h-48">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response.cycle && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-600/50 text-center text-slate-400">
                Cycle: {response.cycle}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        {!response && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-600/50 text-slate-300">
            <p className="mb-4">
              💡 The Zürich engine runs a 9-step deterministic reasoning cycle:
            </p>
            <ol className="space-y-2 ml-4 text-sm">
              <li>1️⃣ <strong>Intake</strong> - Parse input type</li>
              <li>2️⃣ <strong>Preprocess</strong> - Normalize text</li>
              <li>3️⃣ <strong>Tagger</strong> - Classify content & intent</li>
              <li>4️⃣ <strong>Interpret</strong> - Extract meanings & signals</li>
              <li>5️⃣ <strong>Reason</strong> - Build reasoning steps</li>
              <li>6️⃣ <strong>Strategy</strong> - Choose response mode</li>
              <li>7️⃣ <strong>Draft</strong> - Generate draft response</li>
              <li>8️⃣ <strong>Final</strong> - Format final output</li>
              <li>9️⃣ <strong>Cycle</strong> - Orchestrate all modules</li>
            </ol>
            <p className="mt-4 text-xs text-slate-400">
              ✨ No AI calls, no external API, 100% deterministic logic
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
