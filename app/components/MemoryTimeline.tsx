'use client';

import React from 'react';

interface Message {
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
  rawData?: any;
}

interface MemoryTimelineProps {
  messages: Message[];
}

export function MemoryTimeline({ messages }: MemoryTimelineProps) {
  return (
    <div className="w-full">
      <div className="space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">
              {msg.type === 'user' ? '📝' : '🤖'} {msg.text ? msg.text.substring(0, 60) : '(empty)'}...
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
