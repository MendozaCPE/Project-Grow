"use server";

import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  // Validate required field
  if (!email) {
    return { error: "Email is required" };
  }

  // Create Supabase client
  const supabase = await createClient();

  // Request password reset
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    console.error("Password reset error:", error);
    // Don't reveal if email exists or not for security
    return { success: true };
  }

  return { success: true };
}
