"use client";

import { useState } from "react";
import { registerUser } from "./actions";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <form action={handleSubmit} className="space-y-3 sm:space-y-4">
      {/* Full Name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-semibold text-[#2E2815] mb-1.5"
        >
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          required
          disabled={loading}
          className="w-full min-h-[48px] px-3 sm:px-4 py-3 rounded-lg border-2 border-[#E3B23C]/30 
                   bg-white text-[#2E2815] placeholder-[#2E2815]/40
                   focus:outline-none focus:border-[#E3B23C] focus:ring-2 focus:ring-[#E3B23C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed text-base"
          placeholder="Juan Dela Cruz"
        />
      </div>

      {/* School */}
      <div>
        <label
          htmlFor="school"
          className="block text-sm font-semibold text-[#2E2815] mb-1.5"
        >
          School
        </label>
        <input
          type="text"
          id="school"
          name="school"
          required
          disabled={loading}
          className="w-full min-h-[48px] px-3 sm:px-4 py-3 rounded-lg border-2 border-[#E3B23C]/30 
                   bg-white text-[#2E2815] placeholder-[#2E2815]/40
                   focus:outline-none focus:border-[#E3B23C] focus:ring-2 focus:ring-[#E3B23C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed text-base"
          placeholder="Sampaguita Elementary School"
        />
      </div>

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
          minLength={8}
          disabled={loading}
          className="w-full min-h-[48px] px-3 sm:px-4 py-3 rounded-lg border-2 border-[#E3B23C]/30 
                   bg-white text-[#2E2815] placeholder-[#2E2815]/40
                   focus:outline-none focus:border-[#E3B23C] focus:ring-2 focus:ring-[#E3B23C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed text-base"
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
          Confirm Password
        </label>
        <input
          type="password"
          id="confirm_password"
          name="confirm_password"
          required
          minLength={8}
          disabled={loading}
          className="w-full min-h-[48px] px-3 sm:px-4 py-3 rounded-lg border-2 border-[#E3B23C]/30 
                   bg-white text-[#2E2815] placeholder-[#2E2815]/40
                   focus:outline-none focus:border-[#E3B23C] focus:ring-2 focus:ring-[#E3B23C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed text-base"
          placeholder="Re-enter your password"
        />
      </div>

      {/* Registration Code */}
      <div>
        <label
          htmlFor="registration_code"
          className="block text-sm font-semibold text-[#2E2815] mb-1.5"
        >
          Registration Code
        </label>
        <input
          type="text"
          id="registration_code"
          name="registration_code"
          required
          disabled={loading}
          className="w-full min-h-[48px] px-3 sm:px-4 py-3 rounded-lg border-2 border-[#E3B23C]/30 
                   bg-white text-[#2E2815] placeholder-[#2E2815]/40
                   focus:outline-none focus:border-[#E3B23C] focus:ring-2 focus:ring-[#E3B23C]/20
                   disabled:opacity-50 disabled:cursor-not-allowed text-base"
          placeholder="Enter registration code"
        />
        <p className="text-xs text-[#2E2815]/60 mt-1">
          Contact your administrator for the registration code
        </p>
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
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
