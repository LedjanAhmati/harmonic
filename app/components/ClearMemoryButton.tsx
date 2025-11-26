"use client";

import { useState } from "react";

interface ClearMemoryButtonProps {
  sessionId?: string;
  onCleared?: () => void;
}

export default function ClearMemoryButton({
  sessionId = "default",
  onCleared,
}: ClearMemoryButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleClear() {
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/memory/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFeedback({
          type: "success",
          message: "✓ Conversation cleared",
        });
        setShowConfirm(false);

        // Optional: call callback or refresh
        if (onCleared) {
          onCleared();
        }

        // Auto-dismiss feedback after 2 seconds
        setTimeout(() => setFeedback(null), 2000);
      } else {
        setFeedback({
          type: "error",
          message: "Failed to clear conversation",
        });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Error clearing memory",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setShowConfirm(!showConfirm)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
        title="Clear conversation history"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            Clearing...
          </>
        ) : (
          <>
            <span>🗑️</span>
            Clear
          </>
        )}
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && !loading && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80">
          <h3 className="font-semibold text-gray-900 mb-2">
            Clear conversation?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This will permanently delete all messages in this conversation.
            This action cannot be undone.
          </p>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`absolute right-0 mt-2 px-3 py-2 text-sm rounded-lg transition-opacity ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
