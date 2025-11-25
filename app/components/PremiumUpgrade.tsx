'use client';

import { useState } from 'react';

interface PremiumUpgradeProps {
  userEmail?: string;
  onSuccess?: () => void;
}

export function PremiumUpgrade({ userEmail, onSuccess }: PremiumUpgradeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!userEmail) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/premium/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to LemonSqueezy checkout
      window.location.href = data.checkoutUrl;
      onSuccess?.();
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err.message : 'Checkout failed';
      setError(error);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 border-2 border-purple-300">
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">🚀 Upgrade to Premium</h3>
          <p className="text-gray-700 mt-1">Unlock advanced features & unlimited conversations</p>
        </div>

        <div className="space-y-2 text-sm text-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>Unlimited Trinity conversations</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>Advanced debate system</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>Memory threading & persistence</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>Export & analyze results</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? '⏳ Loading checkout...' : '💳 Upgrade Now'}
        </button>

        <p className="text-xs text-gray-600 text-center">
          Secure payment powered by LemonSqueezy
        </p>
      </div>
    </div>
  );
}
