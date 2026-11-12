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
      <div className="text-center animate-scale-in">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#2E2815] mb-3">Check Your Email</h2>
        <p className="text-[#8B7E6A] mb-8 leading-relaxed">
          If an account exists with that email, we've sent you a password reset link.
        </p>

        <a
          href="/login"
          className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 py-3 
                   bg-gradient-to-r from-[#E3B23C] to-[#C9962A]
                   hover:from-[#C9962A] hover:to-[#B8851F]
                   text-white font-bold rounded-2xl transition-all duration-200
                   shadow-lg shadow-[#E3B23C]/30 hover:shadow-xl hover:shadow-[#E3B23C]/40
                   active:scale-[0.98] group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Sign In</span>
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="group">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-[#2E2815] mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-[#8B7E6A] group-focus-within:text-[#E3B23C] transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </div>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            disabled={loading}
            className="w-full min-h-[56px] pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200
                     bg-gray-50 text-[#2E2815] placeholder-[#8B7E6A]
                     focus:outline-none focus:border-[#E3B23C] focus:bg-white focus:ring-4 focus:ring-[#E3B23C]/10
                     disabled:opacity-50 disabled:cursor-not-allowed text-base
                     transition-all duration-200"
            placeholder="juan.delacruz@example.com"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 animate-slide-in-up">
          <p className="text-sm text-red-800 font-medium text-center">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[56px] px-6 py-3 bg-gradient-to-r from-[#E3B23C] to-[#C9962A]
                 hover:from-[#C9962A] hover:to-[#B8851F] active:scale-[0.98]
                 text-white font-bold rounded-2xl transition-all duration-200 text-base
                 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation
                 shadow-lg shadow-[#E3B23C]/30 hover:shadow-xl hover:shadow-[#E3B23C]/40
                 flex items-center justify-center gap-2 group"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Sending...</span>
          </>
        ) : (
          <>
            <span>Send Reset Link</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
