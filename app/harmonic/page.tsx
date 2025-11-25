/**
 * Harmonic Main Page
 * Multi-persona AI debate interface
 */

"use client";

import { useState } from "react";
import { MemoryTimeline } from "@/app/components/MemoryTimeline";

interface Message {
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
  persona?: string;
}

interface APIResponse {
  success: boolean;
  messages?: Array<{
    role: string;
    content: string;
    persona?: string;
  }>;
  summary?: string;
  reply?: {
    messages?: Array<{
      role: string;
      content: string;
      persona?: string;
    }>;
  };
}

// Call local SAAS API for debate
async function callSaasDebate(topic: string): Promise<any> {
  try {
    const response = await fetch("http://localhost:5000/debate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("SAAS API error:", errorMsg);
    return {
      error: true,
      message: `⚠️ SAAS API unavailable: ${errorMsg}`
    };
  }
}

export default function HarmonicPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [summary, setSummary] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setLoading(true);

    try {
      // Add user message
      const userMsg: Message = {
        type: 'user',
        text: topic,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMsg]);

      // Call SAAS API instead of direct Puter calls
      const result = await callSaasDebate(topic);

      if (result.error) {
        const fallbackMsg: Message = {
          type: 'ai',
          text: result.message,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, fallbackMsg]);
        setSummary(`⚠️ ${result.message}`);
      } else {
        // Process responses from SAAS API
        const debateMessages = result.responses.map((r: any) => ({
          type: 'ai' as const,
          text: `${r.emoji} ${r.persona.toUpperCase()}: ${r.response}`,
          timestamp: Date.now(),
          persona: r.persona,
        }));

        setMessages(prev => [...prev, ...debateMessages]);

        // Show stats
        setSummary(`🎼 Trinity SAAS Debate\nTopic: "${topic}"\n🔄 Cache Hit Rate: ${result.stats.cacheHitRate}\n⏱️ Total Time: ${result.stats.totalLatencyMs}ms\n✅ Status: Complete`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Debate error:", errorMsg);
      const fallbackMsg: Message = {
        type: 'ai',
        text: `⚠️ Error: ${errorMsg}. Make sure SAAS API is running on port 5000.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setTopic("");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎼 Harmonic Trinity
          </h1>
          <p className="text-purple-300 text-lg">Real AI Multi-Persona Debate with Puter.ai</p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="mb-8 bg-slate-800 rounded-lg p-6 border border-purple-500/30">
          <div className="flex gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ask something to debate..."
              className="flex-1 bg-slate-700 text-white px-4 py-3 rounded border border-purple-500/50 focus:outline-none focus:border-purple-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition disabled:opacity-50"
            >
              {loading ? "Debating..." : "Debate"}
            </button>
          </div>
        </form>

        {/* Timeline */}
        {messages.length > 0 && (
          <div className="mb-8">
            <MemoryTimeline messages={messages} />
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/30 text-purple-100 whitespace-pre-wrap">
            {summary}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin">
              <div className="w-12 h-12 border-4 border-purple-400 border-t-pink-400 rounded-full"></div>
            </div>
            <p className="text-purple-300 mt-4">Trinity is thinking with real AI...</p>
          </div>
        )}
      </div>
    </div>
  );
}
