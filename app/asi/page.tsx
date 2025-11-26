'use client';

import React, { useState, useEffect } from 'react';
import { asiFusion, getBrainStats } from '@/puter/asiFusion';

interface FusionResult {
  query: string;
  trinity: {
    alba: string;
    albi: string;
    jona: string;
    blerina: string;
    perspectives: number;
  };
  zurich: {
    deterministic: boolean;
    reasoning: string;
    confidence: number;
  };
  brain: {
    apis_found: number;
    docs_found: number;
    concepts_found: number;
    total_sources: number;
  };
  fusion: {
    meta_response: string;
    synthesis: string;
    confidence_score: number;
    reasoning_path: string[];
  };
  timestamp: string;
}

interface BrainStats {
  apis: number;
  docs: number;
  concepts: number;
}

export default function ASIPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<FusionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [brainStats, setBrainStats] = useState<BrainStats | null>(null);
  const [activeTab, setActiveTab] = useState('fusion');

  // Load brain stats on mount
  useEffect(() => {
    const fetchBrainStats = async () => {
      try {
        const stats = await getBrainStats();
        setBrainStats(stats.brain || {});
      } catch (error) {
        console.error('Failed to fetch brain stats:', error);
      }
    };
    fetchBrainStats();
  }, []);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const fusionResult = await asiFusion(query);
      setResult(fusionResult);
      setActiveTab('fusion');
    } catch (error) {
      console.error('Fusion failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-4">
            🔮 ASI Fusion Engine
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Multi-layer reasoning combining Trinity AI, Zürich Logic, and 8TB Brain Memory
          </p>
        </div>

        {/* Query Input */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-purple-500/30 p-8 mb-8">
          <form onSubmit={handleQuery} className="space-y-4">
            <label className="block text-purple-200 font-semibold">Ask Harmonic:</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What is harmonic? How does Zürich reasoning work? Tell me about the brain system..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Fusing systems...
                </>
              ) : (
                <>
                  ⚡ Fuse & Analyze
                </>
              )}
            </button>
          </form>
        </div>

        {/* System Status */}
        {brainStats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-blue-500/30 p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">🧠</div>
              <div className="text-sm text-blue-200 mt-2">Trinity</div>
              <div className="text-xs text-blue-300">5 Personas</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-green-500/30 p-4 text-center">
              <div className="text-3xl font-bold text-green-400">⚙️</div>
              <div className="text-sm text-green-200 mt-2">Zürich</div>
              <div className="text-xs text-green-300">9-Module Logic</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-amber-500/30 p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">📚</div>
              <div className="text-sm text-amber-200 mt-2">Brain</div>
              <div className="text-xs text-amber-300">
                {(brainStats.apis || 0) + (brainStats.docs || 0) + (brainStats.concepts || 0)} files
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-pink-500/30 p-4 text-center">
              <div className="text-3xl font-bold text-pink-400">🔮</div>
              <div className="text-sm text-pink-200 mt-2">ASI</div>
              <div className="text-xs text-pink-300">Meta-Fusion</div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-purple-500/30 overflow-x-auto">
              {['fusion', 'trinity', 'zurich', 'brain'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-300'
                      : 'border-transparent text-purple-200/50 hover:text-purple-200'
                  }`}
                >
                  {tab === 'fusion' && '🔮 Meta-Fusion'}
                  {tab === 'trinity' && '🧠 Trinity'}
                  {tab === 'zurich' && '⚙️ Zürich'}
                  {tab === 'brain' && '📚 Brain'}
                </button>
              ))}
            </div>

            {/* Meta-Fusion Tab */}
            {activeTab === 'fusion' && (
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-purple-500/30 p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-purple-300 mb-4">🔮 ASI Meta-Response</h2>
                  <div className="bg-slate-900/50 rounded-lg p-6 whitespace-pre-wrap text-purple-100 font-mono text-sm leading-relaxed">
                    {result.fusion.meta_response}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-purple-300 font-semibold mb-2">Synthesis</h3>
                    <p className="text-purple-200">{result.fusion.synthesis}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-purple-300 font-semibold mb-2">Confidence Score</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                          style={{ width: `${result.fusion.confidence_score * 100}%` }}
                        />
                      </div>
                      <span className="text-purple-300 font-bold">{(result.fusion.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-purple-300 font-semibold mb-3">Reasoning Path</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.fusion.reasoning_path.map((step, i) => (
                      <React.Fragment key={i}>
                        <div className="bg-purple-600/30 border border-purple-500 rounded-full px-4 py-2 text-purple-200 text-sm font-semibold">
                          {step}
                        </div>
                        {i < result.fusion.reasoning_path.length - 1 && (
                          <div className="text-purple-400">→</div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Trinity Tab */}
            {activeTab === 'trinity' && (
              <div className="grid grid-cols-2 gap-6">
                {[
                  { name: 'Alba (Creative)', text: result.trinity.alba, color: 'from-pink-500' },
                  { name: 'Albi (Analytical)', text: result.trinity.albi, color: 'from-blue-500' },
                  { name: 'Jona (Intuitive)', text: result.trinity.jona, color: 'from-green-500' },
                  { name: 'Blerina (Wisdom)', text: result.trinity.blerina, color: 'from-amber-500' }
                ].map((persona) => (
                  <div key={persona.name} className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-purple-500/30 p-6">
                    <h3 className={`text-xl font-bold bg-gradient-to-r ${persona.color} to-purple-400 bg-clip-text text-transparent mb-3`}>
                      {persona.name}
                    </h3>
                    <p className="text-purple-200">{persona.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Zürich Tab */}
            {activeTab === 'zurich' && (
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-green-500/30 p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-green-300 mb-4">⚙️ Deterministic Reasoning</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <div className="text-sm text-green-200">Mode</div>
                      <div className="text-2xl font-bold text-green-400">
                        {result.zurich.deterministic ? '100% Logic' : 'Mixed'}
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <div className="text-sm text-green-200">Confidence</div>
                      <div className="text-2xl font-bold text-green-400">{(result.zurich.confidence * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-6 whitespace-pre-wrap text-green-100 font-mono text-sm">
                    {result.zurich.reasoning}
                  </div>
                </div>
              </div>
            )}

            {/* Brain Tab */}
            {activeTab === 'brain' && (
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-amber-500/30 p-8 space-y-6">
                <h3 className="text-xl font-bold text-amber-300">📚 8TB Brain Memory Results</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-amber-400">{result.brain.apis_found}</div>
                    <div className="text-sm text-amber-200 mt-2">APIs Found</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-amber-400">{result.brain.docs_found}</div>
                    <div className="text-sm text-amber-200 mt-2">Docs Found</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-amber-400">{result.brain.concepts_found}</div>
                    <div className="text-sm text-amber-200 mt-2">Concepts Found</div>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-6">
                  <h4 className="text-amber-300 font-semibold mb-3">Total Sources: {result.brain.total_sources}</h4>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-400 h-3 rounded-full"
                      style={{ width: `${Math.min((result.brain.total_sources / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-purple-300 text-sm">
              <p>Query processed at {new Date(result.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔮</div>
            <p className="text-purple-300 text-xl mb-4">Enter a query to begin multi-layer analysis</p>
            <p className="text-purple-200/50 max-w-2xl mx-auto">
              Ask anything and watch Trinity debate, Zürich reason, Brain search, and ASI synthesize into comprehensive understanding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
