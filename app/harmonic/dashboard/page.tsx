"use client";

import { useState } from "react";
import { generateHarmonicPrompt } from "@/puter/harmonicPrompt";

export default function HarmonicDashboard() {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runScan() {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);
    setMessage(null);

    const prompt = generateHarmonicPrompt(text.split(" ").slice(0, 5));

    try {
      // PUTER AI – pa OpenAI key
      // @ts-ignore
      const response = await puter.ai.chat(prompt, {
        model: "gpt-5-nano",
      });

      try {
        const json = JSON.parse(response);
        setResult(json);
      } catch {
        setResult({ error: "Parsing error", raw: response });
      }
    } catch (e) {
      setResult({ error: "Puter AI error", details: String(e) });
    }

    setLoading(false);
  }

  async function goPremium() {
    if (!email.trim()) {
      setMessage("Vendos email-in për premium.");
      return;
    }

    setCheckoutLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/premium/checkout", {
        method: "POST",
        body: JSON.stringify({
          productId: "harmonic-premium",
          userEmail: email,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage("Gabim gjatë krijimit të checkout.");
      } else {
        // ridrejto përdoruesin te checkout
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      setMessage("Gabim gjatë lidhjes me backend.");
    }

    setCheckoutLoading(false);
  }

  return (
    <main className="min-h-screen p-10 bg-white">
      <h1 className="text-3xl font-bold mb-4">Harmonic Dashboard</h1>

      <p className="text-gray-600 mb-6 max-w-2xl">
        Shkruaj sesi ndihesh, mendimet, energjinë tënde. AI do analizojë
        strukturën tënde harmonike në 9 dimensione.
      </p>

      <textarea
        placeholder="Përshkruaj mendimet ose gjendjen tënde..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-40 p-4 border rounded-lg mb-4 bg-gray-50"
      />

      <div className="flex gap-4 items-center mb-6">
        <button
          onClick={runScan}
          disabled={loading}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading ? "Duke analizuar..." : "Run Harmonic Scan →"}
        </button>
      </div>

      {/* Premium zona */}
      <div className="mt-8 p-4 border rounded-lg bg-yellow-50 max-w-xl">
        <h2 className="font-semibold mb-2">Harmonic Premium</h2>
        <p className="text-sm text-gray-700 mb-3">
          Shkarko raport të plotë PDF, ruaj rezultatet dhe merr qasje në
          analiza të avancuara.
        </p>

        <input
          type="email"
          placeholder="Email-i yt për premium..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <button
          onClick={goPremium}
          disabled={checkoutLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-60"
        >
          {checkoutLoading ? "Duke hapur checkout..." : "Go Premium →"}
        </button>

        {message && (
          <p className="text-sm text-red-600 mt-2">
            {message}
          </p>
        )}
      </div>

      {result && (
        <pre className="mt-8 bg-gray-100 p-4 rounded-lg border overflow-auto max-h-[500px]">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
