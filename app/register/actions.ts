"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function registerUser(formData: FormData) {
  const fullName = formData.get("full_name") as string;
  const school = formData.get("school") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;
  const registrationCode = formData.get("registration_code") as string;

  // Validate required fields
  if (!fullName || !school || !email || !password || !confirmPassword || !registrationCode) {
    return { error: "All fields are required" };
  }

  // Validate passwords match
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  // Validate password length
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  // Validate registration code (SERVER-SIDE ONLY)
  const validCode = process.env.REGISTRATION_CODE;
  if (!validCode) {
    console.error("REGISTRATION_CODE not set in environment variables");
    return { error: "Registration is not available at this time" };
  }

  if (registrationCode !== validCode) {
    return { error: "Invalid registration code. Please contact your administrator." };
  }

  // Create Supabase client
  const supabase = await createClient();

  // Sign up user with metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        school: school,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/login?confirmed=true`,
      // Skip email confirmation to avoid rate limits
      // Note: This only works if "Enable email confirmations" is disabled in Supabase settings
    },
  });

  if (error) {
    // Friendly error messages
    if (error.message.includes("already registered")) {
      return { error: "This email is already registered. Please sign in instead." };
    }
    if (error.message.includes("Password should be")) {
      return { error: "Password is too weak. Please use a stronger password." };
    }
    if (error.message.includes("Invalid email")) {
      return { error: "Please enter a valid email address." };
    }
    return { error: error.message || "Failed to create account. Please try again." };
  }

  if (!data.user) {
    return { error: "Failed to create account. Please try again." };
  }

  // With auto-confirmation enabled, users should have a session immediately
  if (data.session) {
    // User is auto-confirmed and logged in
    // Redirect to login to properly route based on role
    redirect("/login?registered=true");
  }

  // Fallback: if somehow no session, still redirect to login
  redirect("/login?registered=true");
}
