import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SessionsList from "./SessionsList";
import MySubmissions from "./MySubmissions";

export default async function TeacherDashboard() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Fetch all LAC sessions (newest first)
  const { data: sessions } = await supabase
    .from("lac_sessions")
    .select("*")
    .order("session_date", { ascending: false });

  // Fetch teacher's submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      *,
      lac_sessions (
        id,
        session_no,
        title,
        session_date,
        locked
      )
    `)
    .eq("teacher_id", user.id)
    .order("updated_at", { ascending: false });

  // Create a map of session statuses for this teacher
  const submissionMap = new Map(
    submissions?.map((sub: any) => [sub.session_id, sub]) || []
  );

  // Separate submissions into drafts and submitted
  const submittedForms = submissions?.filter((sub: any) => sub.status === "submitted") || [];
  const draftForms = submissions?.filter((sub: any) => sub.status === "draft") || [];

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Greeting */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2E2815] mb-2">
          Welcome back, {profile.full_name}!
        </h1>
        <p className="text-sm sm:text-base text-[#2E2815]/70">
          {profile.school}
        </p>
      </div>

      {/* LAC Sessions List */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] mb-3 sm:mb-4 px-1">
          LAC Sessions
        </h2>
        <SessionsList 
          sessions={sessions || []} 
          submissionMap={submissionMap}
        />
      </div>

      {/* My Drafts */}
      {draftForms.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] mb-3 sm:mb-4 px-1">
            My Drafts ({draftForms.length})
          </h2>
          <MySubmissions 
            submissions={draftForms} 
            emptyMessage="You don't have any drafts. Start filling out a form from the LAC Sessions above."
          />
        </div>
      )}

      {/* My Submitted Forms */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] mb-3 sm:mb-4 px-1">
          My Submitted Forms ({submittedForms.length})
        </h2>
        <MySubmissions 
          submissions={submittedForms} 
          emptyMessage="You haven't submitted any forms yet. Complete and submit a form to see it here."
        />
      </div>
    </div>
  );
}
