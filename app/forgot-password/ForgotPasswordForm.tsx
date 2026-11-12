"use client";

import { useState } from "react";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await requestPasswordReset(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#E3B23C]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[#E3B23C]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-[#2E2815] mb-2">Check Your Email</h2>
        <p className="text-[#2E2815]/70 mb-6">
          If an account exists with that email, we've sent you a password reset link.
        </p>

        <a
          href="/login"
          className="inline-block min-h-[48px] px-6 py-3 bg-[#E3B23C] hover:bg-[#C9962A] 
                   text-[#2E2815] font-semibold rounded-lg transition-colors"
        >
          Back to Sign In
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
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
          className="w-full min-h-[48px] px-4 py-3 rounded-lg border-2 border-[#E3B23C]/30 
                   bg-white text-[#2E2815] placeholder-[#2E2815]/40
                   focus:outline-none focus:border-[#E3B23C] focus:ring-2 focus:ring-[#E3B23C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="juan.delacruz@example.com"
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
                 text-[#2E2815] font-semibold rounded-lg transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}
