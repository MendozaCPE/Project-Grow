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
      className="min-h-[48px] px-3 sm:px-4 py-2 bg-[#E3B23C] hover:bg-[#C9962A] 
               text-[#2E2815] font-semibold rounded-lg transition-colors text-sm
               disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
      title="Sign out"
    >
      {loading ? "..." : "Logout"}
    </button>
  );
}
