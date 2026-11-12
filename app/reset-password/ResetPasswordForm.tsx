"use client";

import { useState } from "react";
import { resetPassword } from "./actions";

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, the server action will redirect
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* New Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-[#2E2815] mb-1.5"
        >
          New Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={loading}
          className="w-full min-h-[48px] px-4 py-3 rounded-lg border-2 border-[#E3B23C]/30 
                   bg-white text-[#2E2815] placeholder-[#2E2815]/40
                   focus:outline-none focus:border-[#E3B23C] focus:ring-2 focus:ring-[#E3B23C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Minimum 8 characters"
        />
        <p className="text-xs text-[#2E2815]/60 mt-1">
          Must be at least 8 characters long
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirm_password"
          className="block text-sm font-semibold text-[#2E2815] mb-1.5"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirm_password"
          name="confirm_password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={loading}
          className="w-full min-h-[48px] px-4 py-3 rounded-lg border-2 border-[#E3B23C]/30 
                   bg-white text-[#2E2815] placeholder-[#2E2815]/40
                   focus:outline-none focus:border-[#E3B23C] focus:ring-2 focus:ring-[#E3B23C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Re-enter your password"
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
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </button>

      <div className="text-center">
        <a
          href="/login"
          className="text-sm text-[#2E2815]/70 hover:text-[#2E2815] underline"
        >
          Back to Sign In
        </a>
      </div>
    </form>
  );
}
