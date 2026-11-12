"use client";

import { useState } from "react";
import { signIn } from "./actions";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, the server action will redirect
  }

  return (
    <form action={handleSubmit} className="space-y-3 sm:space-y-4">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-[#2E2815] mb-1.5"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          disabled={loading}
          className="w-full min-h-[48px] px-3 sm:px-4 py-3 rounded-lg border-2 border-[#E3B23C]/30 
                   bg-white text-[#2E2815] placeholder-[#2E2815]/40
                   focus:outline-none focus:border-[#E3B23C] focus:ring-2 focus:ring-[#E3B23C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed text-base"
          placeholder="juan.delacruz@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-[#2E2815] mb-1.5"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          autoComplete="current-password"
          disabled={loading}
          className="w-full min-h-[48px] px-3 sm:px-4 py-3 rounded-lg border-2 border-[#E3B23C]/30 
                   bg-white text-[#2E2815] placeholder-[#2E2815]/40
                   focus:outline-none focus:border-[#E3B23C] focus:ring-2 focus:ring-[#E3B23C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed text-base"
          placeholder="Enter your password"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[48px] px-6 py-3 bg-[#E3B23C] hover:bg-[#C9962A] 
                 text-[#2E2815] font-semibold rounded-lg transition-colors text-base
                 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
