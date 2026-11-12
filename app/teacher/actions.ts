"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteSubmission(submissionId: string) {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Call the database function to perform soft delete
  // This bypasses RLS issues by running with SECURITY DEFINER
  const { data, error } = await supabase.rpc('soft_delete_submission', {
    submission_uuid: submissionId
  });

  if (error) {
    console.error("Error deleting submission:", error);
    throw new Error(error.message || "Failed to delete submission");
  }

  // Revalidate the teacher dashboard to reflect the deletion
  revalidatePath("/teacher");
  
  return { success: true };
}
