"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate required fields
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Create Supabase client
  const supabase = await createClient();

  // Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    // Friendly error messages
    if (authError.message.includes("Invalid login credentials")) {
      return { error: "Invalid email or password. Please try again." };
    }
    if (authError.message.includes("Email not confirmed")) {
      return { error: "Please confirm your email before signing in." };
    }
    return { error: "Failed to sign in. Please try again." };
  }

  if (!authData.user) {
    return { error: "Failed to sign in. Please try again." };
  }

  // Fetch user profile to check role and active status
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, active, full_name")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    // Sign out if profile doesn't exist
    await supabase.auth.signOut();
    return { error: "Account not found. Please contact the administrator." };
  }

  // Check if account is active
  if (!profile.active) {
    // Sign out and redirect
    await supabase.auth.signOut();
    redirect("/login?deactivated=true");
  }

  // Redirect based on role
  if (profile.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/teacher");
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
