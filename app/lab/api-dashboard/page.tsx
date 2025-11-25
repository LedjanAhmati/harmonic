"use client";

import { useState, useEffect } from "react";

interface APIStats {
  totalEndpoints: number;
  debateRoutes: number;
  personaRoutes: number;
  analysisRoutes: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  totalRequests: number;
  uptime: string;
}

interface ProcessLog {
  timestamp: string;
  process: string;
  status: "running" | "completed" | "error";
  details: string;
}

export default function APIDashboard() {
  const [stats, setStats] = useState<APIStats | null>(null);
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAPI, setGeneratingAPI] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api-stats", {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewAPI = async () => {
    setGeneratingAPI(true);
    try {
      const res = await fetch("http://localhost:5000/generate-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: ["AI", "Leadership", "Innovation"],
          perspectives: 5,
          questions: 10,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [
          {
            timestamp: new Date().toLocaleTimeString(),
            process: "API Generation",
            status: "completed",
            details: `Generated ${data.newEndpoints} new endpoints`,
          },
          ...prev,
        ]);
        await fetchStats();
      }
    } catch (err) {
      console.error("Failed to generate API:", err);
      setLogs((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          process: "API Generation",
          status: "error",
          details: "Generation failed",
        },
        ...prev,
      ]);
    } finally {
      setGeneratingAPI(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-white text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚀 Harmonic API Dashboard
          </h1>
          <p className="text-purple-300">Real-time API generation & statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Endpoints */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
            <div className="text-sm font-semibold text-blue-100 mb-2">
              Total Endpoints
            </div>
            <div className="text-4xl font-bold mb-2">
              {stats?.totalEndpoints.toLocaleString()}
            </div>
            <div className="text-xs text-blue-100">
              Production-ready APIs
            </div>
          </div>

          {/* Debate Routes */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
            <div className="text-sm font-semibold text-emerald-100 mb-2">
              Debate Routes
            </div>
            <div className="text-4xl font-bold mb-2">
              {stats?.debateRoutes.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-100">
              Multi-persona debates
            </div>
          </div>

          {/* Persona Routes */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-lg">
            <div className="text-sm font-semibold text-amber-100 mb-2">
              Persona Routes
            </div>
            <div className="text-4xl font-bold mb-2">
              {stats?.personaRoutes.toLocaleString()}
            </div>
            <div className="text-xs text-amber-100">Individual personas</div>
          </div>

          {/* Analysis Routes */}
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg p-6 text-white shadow-lg">
            <div className="text-sm font-semibold text-rose-100 mb-2">
              Analysis Routes
            </div>
            <div className="text-4xl font-bold mb-2">
              {stats?.analysisRoutes.toLocaleString()}
            </div>
            <div className="text-xs text-rose-100">Comparative analysis</div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Cache Performance */}
          <div className="bg-slate-800 rounded-lg p-6 text-white border border-purple-500/30">
            <h3 className="text-lg font-semibold mb-4">📊 Cache Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Cache Hits:</span>
                <span className="font-bold text-emerald-400">
                  {stats?.cacheHits}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Cache Misses:</span>
                <span className="font-bold text-rose-400">
                  {stats?.cacheMisses}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Hit Rate:</span>
                <span className="font-bold text-blue-400">
                  {(
                    ((stats?.cacheHits || 0) /
                      ((stats?.cacheHits || 0) + (stats?.cacheMisses || 1))) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Response Times */}
          <div className="bg-slate-800 rounded-lg p-6 text-white border border-purple-500/30">
            <h3 className="text-lg font-semibold mb-4">⏱️ Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Avg Response:</span>
                <span className="font-bold text-amber-400">
                  {stats?.averageResponseTime.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total Requests:</span>
                <span className="font-bold text-purple-400">
                  {stats?.totalRequests.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Uptime:</span>
                <span className="font-bold text-emerald-400">
                  {stats?.uptime}
                </span>
              </div>
            </div>
          </div>

          {/* Generate API Button */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg p-6 text-white border border-purple-400/50 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-4">🔨 Generate APIs</h3>
              <p className="text-sm text-purple-100 mb-4">
                Create new endpoints programmatically
              </p>
            </div>
            <button
              onClick={generateNewAPI}
              disabled={generatingAPI}
              className="bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {generatingAPI ? "Generating..." : "Generate APIs"}
            </button>
          </div>
        </div>

        {/* Process Logs */}
        <div className="bg-slate-800 rounded-lg p-6 text-white border border-purple-500/30">
          <h3 className="text-lg font-semibold mb-4">📋 Process Logs</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-slate-400 text-center py-8">
                No processes logged yet
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className="bg-slate-700 rounded p-4 border-l-4 border-purple-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          log.status === "completed"
                            ? "bg-emerald-400"
                            : log.status === "running"
                              ? "bg-amber-400 animate-pulse"
                              : "bg-rose-400"
                        }`}
                      />
                      <span className="font-semibold">{log.process}</span>
                    </div>
                    <span className="text-xs text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-300">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* API Documentation Links */}
        <div className="mt-12 bg-slate-800 rounded-lg p-6 text-white border border-purple-500/30">
          <h3 className="text-lg font-semibold mb-4">📚 API Documentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                fetch('http://localhost:5000/docs/postman-collection.json')
                  .then(r => r.json())
                  .then(data => {
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'harmonic-postman-collection.json';
                    a.click();
                  });
              }}
              className="bg-slate-700 hover:bg-slate-600 p-4 rounded text-center transition cursor-pointer"
            >
              <div className="text-2xl mb-2">📮</div>
              <div className="font-semibold">Postman Collection</div>
              <div className="text-xs text-slate-400">Download & import</div>
            </button>

            <a
              href="/docs/openapi.json"
              download
              className="bg-slate-700 hover:bg-slate-600 p-4 rounded text-center transition cursor-pointer"
            >
              <div className="text-2xl mb-2">📖</div>
              <div className="font-semibold">OpenAPI Spec</div>
              <div className="text-xs text-slate-400">Full specification</div>
            </a>

            <a
              href="/docs/API_DOCUMENTATION.md"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-700 hover:bg-slate-600 p-4 rounded text-center transition cursor-pointer"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-semibold">API Reference</div>
              <div className="text-xs text-slate-400">Full documentation</div>
            </a>

            <button
              onClick={() => window.open('http://localhost:5000/health', '_blank')}
              className="bg-slate-700 hover:bg-slate-600 p-4 rounded text-center transition cursor-pointer"
            >
              <div className="text-2xl mb-2">💚</div>
              <div className="font-semibold">API Health</div>
              <div className="text-xs text-slate-400">Server status</div>
            </button>
          </div>
        </div>

        {/* Test API Endpoints */}
        <div className="mt-12 bg-slate-800 rounded-lg p-6 text-white border border-purple-500/30">
          <h3 className="text-lg font-semibold mb-4">🧪 Test Endpoints</h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                fetch('http://localhost:5000/debate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ topic: 'What is the future of AI?' })
                })
                  .then(r => r.json())
                  .then(data => alert(`✅ Debate created!\n\nDebate ID: ${data.debateId}\nPersonas: ${data.responses.length}\nTotal Time: ${data.stats.totalLatencyMs}ms`))
                  .catch(err => alert(`❌ Error: ${err.message}`));
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 p-3 rounded font-semibold transition"
            >
              ▶️ Test Debate Endpoint
            </button>

            <button
              onClick={() => {
                fetch('http://localhost:5000/stats')
                  .then(r => r.json())
                  .then(data => {
                    alert('Cache Stats: ' + data.memoryBank.totalCachedResponses + ' total, Hit Rate: ' + data.memoryBank.hitRate);
                  })
                  .catch(err => alert('Error: ' + err.message));
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold transition"
            >
              View Cache Statistics
            </button>

            <button
              onClick={() => {
                fetch('http://localhost:5000/cache')
                  .then(r => r.json())
                  .then(data => {
                    alert('Cache: ' + data.cacheSize + ' entries stored');
                  })
                  .catch(err => alert('Error: ' + err.message));
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 p-3 rounded font-semibold transition"
            >
              View Cache Contents
            </button>

            <button
              onClick={() => {
                fetch('http://localhost:5000/health')
                  .then(r => r.json())
                  .then(data => {
                    alert('API Status: ' + data.status + ', Uptime: ' + (data.uptime / 3600).toFixed(1) + ' hours');
                  })
                  .catch(err => alert('Server error: ' + err.message));
              }}
              className="w-full bg-rose-600 hover:bg-rose-700 p-3 rounded font-semibold transition"
            >
              Check API Health
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
