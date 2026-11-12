"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LACFormAnswers } from "@/lib/lacForm4";

export async function saveFormDraft(
  sessionId: string,
  answers: LACFormAnswers,
  existingSubmissionId?: string
) {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Check if session exists and is not locked
  const { data: session, error: sessionError } = await supabase
    .from("lac_sessions")
    .select("locked")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error("Session not found");
  }

  if (session.locked) {
    throw new Error("This session is locked and cannot be edited");
  }

  if (existingSubmissionId) {
    // Update existing submission
    const { error } = await supabase
      .from("submissions")
      .update({
        answers: answers as any,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSubmissionId)
      .eq("teacher_id", user.id); // Ensure user owns this submission

    if (error) {
      console.error("Error updating submission:", error);
      throw new Error("Failed to save draft");
    }
  } else {
    // Create new submission
    const { error } = await supabase.from("submissions").insert({
      teacher_id: user.id,
      session_id: sessionId,
      answers: answers as any,
      status: "draft",
    });

    if (error) {
      console.error("Error creating submission:", error);
      throw new Error("Failed to save draft");
    }
  }

  revalidatePath(`/teacher/form/${sessionId}`);
  revalidatePath("/teacher");

  return { success: true };
}

export async function submitForm(
  sessionId: string,
  answers: LACFormAnswers,
  existingSubmissionId?: string
) {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Check if session exists and is not locked
  const { data: session, error: sessionError } = await supabase
    .from("lac_sessions")
    .select("locked")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error("Session not found");
  }

  if (session.locked) {
    throw new Error("This session is locked and cannot be edited");
  }

  if (existingSubmissionId) {
    // Update existing submission to submitted status
    const { error } = await supabase
      .from("submissions")
      .update({
        answers: answers as any,
        status: "submitted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSubmissionId)
      .eq("teacher_id", user.id);

    if (error) {
      console.error("Error submitting form:", error);
      throw new Error("Failed to submit form");
    }
  } else {
    // Create new submission with submitted status
    const { error } = await supabase.from("submissions").insert({
      teacher_id: user.id,
      session_id: sessionId,
      answers: answers as any,
      status: "submitted",
    });

    if (error) {
      console.error("Error submitting form:", error);
      throw new Error("Failed to submit form");
    }
  }

  revalidatePath(`/teacher/form/${sessionId}`);
  revalidatePath("/teacher");

  return { success: true };
}


export async function unsubmitForm(submissionId: string, sessionId: string) {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Check if session exists and is not locked
  const { data: session, error: sessionError } = await supabase
    .from("lac_sessions")
    .select("locked")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error("Session not found");
  }

  if (session.locked) {
    throw new Error("Cannot unsubmit - session is locked");
  }

  // Update submission status back to draft
  const { error } = await supabase
    .from("submissions")
    .update({
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .eq("teacher_id", user.id); // Ensure user owns this submission

  if (error) {
    console.error("Error unsubmitting form:", error);
    throw new Error("Failed to unsubmit form");
  }

  revalidatePath(`/teacher/form/${sessionId}`);
  revalidatePath("/teacher");

  return { success: true };
}
