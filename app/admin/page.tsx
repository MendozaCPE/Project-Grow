import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CreateSessionForm from "./CreateSessionForm";
import SessionsList from "./SessionsList";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile and check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/teacher");
  }

  // Fetch stats
  const { count: teacherCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "teacher")
    .eq("active", true);

  const { count: sessionCount } = await supabase
    .from("lac_sessions")
    .select("*", { count: "exact", head: true });

  const { count: submissionCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted");

  // Fetch all LAC sessions with submission counts
  const { data: sessions } = await supabase
    .from("lac_sessions")
    .select(
      `
      *,
      submissions!submissions_session_id_fkey (
        id,
        status
      )
    `
    )
    .order("session_date", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2E2815] mb-1">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-[#2E2815]/70">
              Welcome back, {profile.full_name}!
            </p>
          </div>
          <Link
            href="/admin/teachers"
            className="bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px] flex items-center justify-center touch-manipulation text-sm sm:text-base"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Manage Teachers
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-[#E3B23C] mb-2">
            {teacherCount || 0}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-[#2E2815]/70">
            Active Teachers
          </div>
        </div>

        <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-[#E3B23C] mb-2">
            {sessionCount || 0}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-[#2E2815]/70">
            LAC Sessions
          </div>
        </div>

        <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-[#E3B23C] mb-2">
            {submissionCount || 0}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-[#2E2815]/70">
            Total Submissions
          </div>
        </div>
      </div>

      {/* Create Session Form */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] mb-3 px-1">
          Create LAC Session
        </h2>
        <CreateSessionForm />
      </div>

      {/* Sessions List */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] mb-3 px-1">
          LAC Sessions
        </h2>
        <SessionsList sessions={sessions || []} />
      </div>
    </div>
  );
}
