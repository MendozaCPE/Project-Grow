"use client";

import { useState } from "react";
import { registerUser } from "./actions";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, the server action will redirect
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div className="group">
        <label htmlFor="full_name" className="block text-sm font-semibold text-[#2E2815] mb-2">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[#8B7E6A] group-focus-within:text-[#E3B23C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            type="text"
            id="full_name"
            name="full_name"
            required
            disabled={loading}
            className="w-full min-h-[56px] pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200
                     bg-gray-50 text-[#2E2815] placeholder-[#8B7E6A]
                     focus:outline-none focus:border-[#E3B23C] focus:bg-white focus:ring-4 focus:ring-[#E3B23C]/10
                     disabled:opacity-50 disabled:cursor-not-allowed text-base transition-all duration-200"
            placeholder="Juan Dela Cruz"
          />
        </div>
      </div>

      {/* School */}
      <div className="group">
        <label htmlFor="school" className="block text-sm font-semibold text-[#2E2815] mb-2">
          School
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[#8B7E6A] group-focus-within:text-[#E3B23C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <input
            type="text"
            id="school"
            name="school"
            required
            disabled={loading}
            className="w-full min-h-[56px] pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200
                     bg-gray-50 text-[#2E2815] placeholder-[#8B7E6A]
                     focus:outline-none focus:border-[#E3B23C] focus:bg-white focus:ring-4 focus:ring-[#E3B23C]/10
                     disabled:opacity-50 disabled:cursor-not-allowed text-base transition-all duration-200"
            placeholder="Sampaguita Elementary School"
          />
        </div>
      </div>

      {/* Email */}
      <div className="group">
        <label htmlFor="email" className="block text-sm font-semibold text-[#2E2815] mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[#8B7E6A] group-focus-within:text-[#E3B23C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={loading}
            className="w-full min-h-[56px] pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200
                     bg-gray-50 text-[#2E2815] placeholder-[#8B7E6A]
                     focus:outline-none focus:border-[#E3B23C] focus:bg-white focus:ring-4 focus:ring-[#E3B23C]/10
                     disabled:opacity-50 disabled:cursor-not-allowed text-base transition-all duration-200"
            placeholder="juan.delacruz@example.com"
          />
        </div>
      </div>

      {/* Password */}
      <div className="group">
        <label htmlFor="password" className="block text-sm font-semibold text-[#2E2815] mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[#8B7E6A] group-focus-within:text-[#E3B23C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            required
            minLength={8}
            disabled={loading}
            className="w-full min-h-[56px] pl-12 pr-12 py-3 rounded-2xl border-2 border-gray-200
                     bg-gray-50 text-[#2E2815] placeholder-[#8B7E6A]
                     focus:outline-none focus:border-[#E3B23C] focus:bg-white focus:ring-4 focus:ring-[#E3B23C]/10
                     disabled:opacity-50 disabled:cursor-not-allowed text-base transition-all duration-200"
            placeholder="Minimum 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8B7E6A] hover:text-[#2E2815] transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-[#8B7E6A] mt-1.5 ml-1">Must be at least 8 characters long</p>
      </div>

      {/* Confirm Password */}
      <div className="group">
        <label htmlFor="confirm_password" className="block text-sm font-semibold text-[#2E2815] mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[#8B7E6A] group-focus-within:text-[#E3B23C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirm_password"
            name="confirm_password"
            required
            minLength={8}
            disabled={loading}
            className="w-full min-h-[56px] pl-12 pr-12 py-3 rounded-2xl border-2 border-gray-200
                     bg-gray-50 text-[#2E2815] placeholder-[#8B7E6A]
                     focus:outline-none focus:border-[#E3B23C] focus:bg-white focus:ring-4 focus:ring-[#E3B23C]/10
                     disabled:opacity-50 disabled:cursor-not-allowed text-base transition-all duration-200"
            placeholder="Re-enter your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8B7E6A] hover:text-[#2E2815] transition-colors"
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Registration Code */}
      <div className="group">
        <label htmlFor="registration_code" className="block text-sm font-semibold text-[#2E2815] mb-2">
          Registration Code
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[#8B7E6A] group-focus-within:text-[#E3B23C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <input
            type="text"
            id="registration_code"
            name="registration_code"
            required
            disabled={loading}
            className="w-full min-h-[56px] pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200
                     bg-gray-50 text-[#2E2815] placeholder-[#8B7E6A]
                     focus:outline-none focus:border-[#E3B23C] focus:bg-white focus:ring-4 focus:ring-[#E3B23C]/10
                     disabled:opacity-50 disabled:cursor-not-allowed text-base transition-all duration-200"
            placeholder="Enter registration code"
          />
        </div>
        <p className="text-xs text-[#8B7E6A] mt-1.5 ml-1">Contact your administrator for the registration code</p>
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
        className="w-full min-h-[56px] px-6 py-3 bg-gradient-to-r from-[#C9962A] to-[#B8851F]
                 hover:from-[#B8851F] hover:to-[#A67419] active:scale-[0.98]
                 text-white font-bold rounded-2xl transition-all duration-200 text-base
                 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation
                 shadow-lg shadow-[#C9962A]/30 hover:shadow-xl hover:shadow-[#C9962A]/40
                 flex items-center justify-center gap-2 group"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
