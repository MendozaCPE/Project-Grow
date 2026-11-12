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

  const session_id = formData.get("session_id") as string;
  const session_no = parseInt(formData.get("session_no") as string);
  const session_date = formData.get("session_date") as string;
  const title = formData.get("title") as string;
  const region = formData.get("region") as string;
  const division = formData.get("division") as string;
  const send_to_all = formData.get("send_to_all") === "true";
  const assigned_teachers_raw = formData.get("assigned_teachers") as string;
  
  // Parse assigned teachers (comma-separated UUIDs)
  const assigned_teachers = assigned_teachers_raw 
    ? assigned_teachers_raw.split(",").filter(id => id.trim()) 
    : [];

  if (!session_id || !session_no || !session_date || !title || !region || !division) {
    throw new Error("All fields are required");
  }

  // If not sending to all, must have at least one teacher selected
  if (!send_to_all && assigned_teachers.length === 0) {
    throw new Error("Please select at least one teacher or choose 'Send to All Teachers'");
  }

  // Check if session ID already exists
  const { data: existingSessionId } = await supabase
    .from("lac_sessions")
    .select("id")
    .eq("session_id", session_id)
    .single();

  if (existingSessionId) {
    throw new Error(`Session ID "${session_id}" already exists`);
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
    session_id,
    session_no,
    session_date,
    title,
    region,
    division,
    send_to_all,
    assigned_teachers,
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

export async function updateSession(formData: FormData) {
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

  const session_id = formData.get("session_id") as string;
  const session_no = parseInt(formData.get("session_no") as string);
  const session_date = formData.get("session_date") as string;
  const title = formData.get("title") as string;
  const region = formData.get("region") as string;
  const division = formData.get("division") as string;
  const send_to_all = formData.get("send_to_all") === "true";
  const assigned_teachers_raw = formData.get("assigned_teachers") as string;
  
  // Parse assigned teachers (comma-separated UUIDs)
  const assigned_teachers = assigned_teachers_raw 
    ? assigned_teachers_raw.split(",").filter(id => id.trim()) 
    : [];

  if (!session_id || !session_no || !session_date || !title || !region || !division) {
    throw new Error("All fields are required");
  }

  // If not sending to all, must have at least one teacher selected
  if (!send_to_all && assigned_teachers.length === 0) {
    throw new Error("Please select at least one teacher or choose 'Send to All Teachers'");
  }

  const { error } = await supabase
    .from("lac_sessions")
    .update({
      session_no,
      session_date,
      title,
      region,
      division,
      send_to_all,
      assigned_teachers,
    })
    .eq("id", session_id);

  if (error) {
    console.error("Error updating session:", error);
    throw new Error("Failed to update session");
  }

  revalidatePath("/admin");
  revalidatePath("/teacher");

  return { success: true };
}
