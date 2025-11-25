"use client";

import { useState } from "react";
import Script from "next/script";
import type { PuterConfig } from "@/puter/usePuterAI";

type User = {
  name: string;
  age: number;
};

let data: User;

export default function Lab() {
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");

  async function run() {
    // sigurohu që puter është ngarkuar
    if (!window.puter || !window.puter.ai) {
      setOut("Puter nuk është gati ende (ngarkim skripti)...");
      return;
    }

    const r = await window.puter.ai.chat(input, {
      model: "gpt-5-nano",
    });

    setOut(typeof r === "string" ? r : JSON.stringify(r, null, 2));
  }

  return (
    <div className="p-10 space-y-4">
      {/* Ngarkojmë puter.js */}
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />

      <h1 className="text-3xl font-bold">Puter Lab 🧪</h1>

      <textarea
        className="p-3 border w-full rounded"
        rows={4}
        placeholder="Shkruaj diçka për t'ia dërguar Puter-it..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={run}
        className="mt-2 px-4 py-2 rounded bg-black text-white"
      >
        Run me Puter
      </button>

      <pre className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">
        {out}
      </pre>
    </div>
  );
}
