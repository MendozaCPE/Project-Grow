"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  // Validate required fields
  if (!password || !confirmPassword) {
    return { error: "Both password fields are required" };
  }

  // Validate passwords match
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  // Validate password length
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  // Create Supabase client
  const supabase = await createClient();

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    if (error.message.includes("Password should be")) {
      return { error: "Password is too weak. Please use a stronger password." };
    }
    return { error: "Failed to reset password. Please try again." };
  }

  // Success - redirect to login
  redirect("/login?reset=true");
}
