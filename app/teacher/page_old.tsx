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
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 page-transition">
      {/* Greeting - Enhanced with gradient and animation */}
      <div className="card card-hover p-6 sm:p-8 mb-6 animate-slide-in-up border-2 border-[#E3B23C]/10 bg-gradient-to-br from-[#FFFDF5] to-[#FBF6E4]">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#E3B23C] to-[#C9962A] rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-[#2E2815]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2E2815] mb-2 leading-tight">
              Welcome back, {profile.full_name}! 👋
            </h1>
            <p className="text-sm sm:text-base text-[#5C5037] font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-[#E3B23C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {profile.school}
            </p>
          </div>
        </div>
      </div>

      {/* LAC Sessions List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#E3B23C] to-[#C9962A] rounded-full" />
            LAC Sessions
          </h2>
          <div className="badge bg-[#E3B23C]/20 text-[#2E2815]">
            {sessions?.length || 0} Total
          </div>
        </div>
        <SessionsList 
          sessions={sessions || []} 
          submissionMap={submissionMap}
        />
      </div>

      {/* My Drafts */}
      {draftForms.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#3B82F6] to-[#2563EB] rounded-full" />
              My Drafts
            </h2>
            <div className="badge badge-info">
              {draftForms.length} {draftForms.length === 1 ? 'Draft' : 'Drafts'}
            </div>
          </div>
          <MySubmissions 
            submissions={draftForms} 
            emptyMessage="You don't have any drafts. Start filling out a form from the LAC Sessions above."
          />
        </div>
      )}

      {/* My Submitted Forms */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#10B981] to-[#059669] rounded-full" />
            My Submitted Forms
          </h2>
          <div className="badge badge-success">
            {submittedForms.length} Submitted
          </div>
        </div>
        <MySubmissions 
          submissions={submittedForms} 
          emptyMessage="You haven't submitted any forms yet. Complete and submit a form to see it here."
        />
      </div>
    </div>
  );
}
