"use client";

import { useState } from "react";
import { signOut } from "@/app/login/actions";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await signOut();
    // Redirect happens in the action
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="min-h-[48px] px-3 sm:px-4 py-2 bg-gradient-to-r from-[#E3B23C] to-[#C9962A]
               hover:from-[#C9962A] hover:to-[#B8851F] 
               text-[#2E2815] font-semibold rounded-lg transition-all duration-200 text-sm
               disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation
               shadow-md hover:shadow-lg hover:scale-105 active:scale-100
               flex items-center gap-2"
      title="Sign out"
    >
      <svg
        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {loading ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        )}
      </svg>
      <span className="hidden sm:inline">{loading ? "Signing out..." : "Logout"}</span>
    </button>
  );
}
