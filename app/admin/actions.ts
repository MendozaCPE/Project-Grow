"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createSession(formData: FormData) {
  const supabase = await createClient();

  // Verify user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const session_no = parseInt(formData.get("session_no") as string);
  const session_date = formData.get("session_date") as string;
  const title = formData.get("title") as string;

  if (!session_no || !session_date || !title) {
    throw new Error("All fields are required");
  }

  // Check if session number already exists
  const { data: existingSession } = await supabase
    .from("lac_sessions")
    .select("id")
    .eq("session_no", session_no)
    .single();

  if (existingSession) {
    throw new Error(`Session number ${session_no} already exists`);
  }

  const { error } = await supabase.from("lac_sessions").insert({
    session_no,
    session_date,
    title,
    locked: false,
  });

  if (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }

  revalidatePath("/admin");
  revalidatePath("/teacher");

  return { success: true };
}

export async function toggleSessionLock(sessionId: string, locked: boolean) {
  const supabase = await createClient();

  // Verify user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("lac_sessions")
    .update({ locked })
    .eq("id", sessionId);

  if (error) {
    console.error("Error toggling lock:", error);
    throw new Error("Failed to toggle lock");
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/sessions/${sessionId}`);
  revalidatePath("/teacher");

  return { success: true };
}

export async function toggleTeacherActive(teacherId: string, active: boolean) {
  const supabase = await createClient();

  // Verify user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ active })
    .eq("id", teacherId);

  if (error) {
    console.error("Error toggling active:", error);
    throw new Error("Failed to update teacher status");
  }

  revalidatePath("/admin/teachers");

  return { success: true };
}
