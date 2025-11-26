/**
 * Example: How to integrate ClearMemoryButton into your header
 * 
 * Place this in your main chat/conversation page header
 */

// In your page.tsx or layout.tsx header section:

import ClearMemoryButton from "@/app/components/ClearMemoryButton";

export default function ChatHeader() {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
      {/* Left: Logo/Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">💬 Harmonic Chat</h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Settings Icon */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <span className="text-xl">⚙️</span>
        </button>

        {/* Clear Button */}
        <ClearMemoryButton
          sessionId="default"
          onCleared={() => {
            // Optional: refresh page or reload messages
            console.log("Conversation cleared!");
          }}
        />

        {/* User Menu */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <span className="text-xl">👤</span>
        </button>
      </div>
    </header>
  );
}
