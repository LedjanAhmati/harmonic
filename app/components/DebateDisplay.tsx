"use client";

import { useState, useEffect } from "react";
import type { PersonaResponse } from "@/lib/multi-persona-orchestrator";

interface DebateDisplayProps {
  userMessage: string;
  responses: PersonaResponse[];
  isLoading: boolean;
  totalLatency?: number;
}

export default function DebateDisplay({
  userMessage,
  responses,
  isLoading,
  totalLatency,
}: DebateDisplayProps) {
  const [displayedResponses, setDisplayedResponses] = useState<PersonaResponse[]>([]);

  useEffect(() => {
    setDisplayedResponses(responses);
  }, [responses]);

  // Count stats
  const completedCount = displayedResponses.filter(
    (r) => r.status === "complete"
  ).length;
  const errorCount = displayedResponses.filter(
    (r) => r.status === "error"
  ).length;

  return (
    <div className="space-y-4">
      {/* User Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900">Your Question:</p>
        <p className="text-gray-800 mt-1">{userMessage}</p>
      </div>

      {/* Stats Header */}
      {(isLoading || displayedResponses.length > 0) && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg">
          <div className="text-sm font-medium text-gray-700">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin">⚡</span>
                Waiting for responses...
              </span>
            ) : (
              <span>
                {completedCount} responded
                {errorCount > 0 && ` • ${errorCount} error${errorCount > 1 ? "s" : ""}`}
              </span>
            )}
          </div>
          {totalLatency && (
            <div className="text-xs text-gray-600">
              {totalLatency}ms total
            </div>
          )}
        </div>
      )}

      {/* Responses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedResponses.map((response, idx) => (
          <div
            key={`${response.personaId}-${idx}`}
            className={`rounded-lg border-2 overflow-hidden transition-all duration-300 ${
              response.status === "complete"
                ? "border-green-300 bg-green-50"
                : response.status === "error"
                ? "border-red-300 bg-red-50"
                : "border-yellow-300 bg-yellow-50 animate-pulse"
            }`}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{response.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    {response.personaName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {response.status === "loading" && (
                  <div className="inline-flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></span>
                    <span className="text-xs font-medium text-gray-600">
                      Waiting...
                    </span>
                  </div>
                )}
                {response.status === "complete" && (
                  <span className="text-xs font-medium text-green-600">
                    ✓ {response.latency}ms
                  </span>
                )}
                {response.status === "error" && (
                  <span className="text-xs font-medium text-red-600">
                    ✗ Error
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3 min-h-24">
              {response.status === "loading" ? (
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-4/6 animate-pulse"></div>
                </div>
              ) : response.status === "error" ? (
                <p className="text-sm text-red-700">
                  {response.error || "Failed to get response"}
                </p>
              ) : (
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {response.response}
                </p>
              )}
            </div>

            {/* Footer */}
            {response.status === "complete" && (
              <div className="px-4 py-2 bg-white border-t border-gray-200 text-xs text-gray-600">
                Completed in {response.latency}ms
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && displayedResponses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No responses yet. Send a message to start the debate!</p>
        </div>
      )}
    </div>
  );
}
