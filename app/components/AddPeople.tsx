"use client";

import { useState } from "react";

export const ALL_PERSONAS = [
  // Trinity Personas (AI)
  { id: "alba", name: "Alba – Creative", emoji: "🌸", type: "ai" },
  { id: "albi", name: "Albi – Analytical", emoji: "💙", type: "ai" },
  { id: "jona", name: "Jona – Intuitive", emoji: "⚡", type: "ai" },
  { id: "blerina", name: "Blerina – Wise", emoji: "🌟", type: "ai" },
  { id: "asi", name: "ASI – Meta", emoji: "🤖", type: "ai" },
  
  // Business Roles
  { id: "manager", name: "Manager", emoji: "👔", type: "role" },
  { id: "analyst", name: "Analyst", emoji: "📊", type: "role" },
  { id: "developer", name: "Developer", emoji: "💻", type: "role" },
  
  // Research Roles
  { id: "researcher", name: "Researcher", emoji: "🔬", type: "role" },
  { id: "strategist", name: "Strategist", emoji: "🎯", type: "role" },
  { id: "designer", name: "Designer", emoji: "🎨", type: "role" },
];

interface AddPeopleProps {
  onAdd: (personaId: string) => void;
  disabled?: boolean;
}

export default function AddPeople({ onAdd, disabled = false }: AddPeopleProps) {
  const [selected, setSelected] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleAdd = () => {
    if (selected) {
      onAdd(selected);
      setSelected("");
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  const selectedPersona = ALL_PERSONAS.find((p) => p.id === selected);

  return (
    <div className="w-full">
      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex gap-3 items-center flex-wrap">
          {/* Dropdown Select */}
          <div className="relative flex-1 min-w-[200px]">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
            >
              <span className="text-gray-700">
                {selectedPersona ? (
                  <span className="flex items-center gap-2">
                    <span>{selectedPersona.emoji}</span>
                    <span>{selectedPersona.name}</span>
                  </span>
                ) : (
                  "Add a persona or role..."
                )}
              </span>
              <span className="text-gray-400">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {/* Group: Trinity AI Personas */}
                <div className="sticky top-0 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 border-b">
                  🤖 Trinity AI Personas
                </div>
                {ALL_PERSONAS.filter((p) => p.type === "ai").map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => {
                      setSelected(persona.id);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 flex items-center gap-2 text-gray-700 border-b last:border-b-0"
                  >
                    <span>{persona.emoji}</span>
                    <span>{persona.name}</span>
                  </button>
                ))}

                {/* Group: Roles */}
                <div className="sticky bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 border-b">
                  👥 Team Roles
                </div>
                {ALL_PERSONAS.filter((p) => p.type === "role").map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => {
                      setSelected(persona.id);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-purple-50 flex items-center gap-2 text-gray-700 border-b last:border-b-0"
                  >
                    <span>{persona.emoji}</span>
                    <span>{persona.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            onKeyDown={handleKeyDown}
            disabled={!selected || disabled}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
          >
            Add Person
          </button>

          {/* Clear Selection */}
          {selected && (
            <button
              onClick={() => setSelected("")}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear selection"
            >
              ✕
            </button>
          )}
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 mt-2">
          Select any AI persona or team role to add them to the conversation
        </p>
      </div>
    </div>
  );
}
