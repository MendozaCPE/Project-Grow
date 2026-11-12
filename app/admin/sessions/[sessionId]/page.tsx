import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SubmissionsList from "./SubmissionsList";

type PageProps = {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ search?: string }>;
};

export default async function SessionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await createClient();
  const { sessionId } = await params;
  const { search } = await searchParams;

  // Check if user is authenticated and admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/teacher");
  }

  // Fetch session details
  const { data: session, error: sessionError } = await supabase
    .from("lac_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    redirect("/admin");
  }

  // Fetch all submissions for this session (only submitted ones)
  let query = supabase
    .from("submissions")
    .select(
      `
      *,
      profiles!submissions_teacher_id_fkey (
        id,
        full_name,
        school
      )
    `
    )
    .eq("session_id", sessionId)
    .eq("status", "submitted")
    .order("updated_at", { ascending: false });

  const { data: submissions } = await query;

  // Filter by search if provided
  const filteredSubmissions = search
    ? submissions?.filter((sub) =>
        sub.profiles.full_name.toLowerCase().includes(search.toLowerCase())
      )
    : submissions;

  const formattedDate = new Date(session.session_date).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Back Button */}
      <Link
        href="/admin"
        className="inline-flex items-center text-[#E3B23C] hover:text-[#C9962A] mb-4 text-sm sm:text-base"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Admin Dashboard
      </Link>

      {/* Session Header */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-start gap-3 sm:gap-4 mb-3">
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-[#E3B23C] rounded-lg flex items-center justify-center">
            <span className="text-lg sm:text-xl font-bold text-[#2E2815]">
              {session.session_no}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2E2815] mb-1">
                  {session.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#2E2815]/70 mb-2">
                  {formattedDate}
                </p>
              </div>
              {/* Download All Button */}
              {filteredSubmissions && filteredSubmissions.length > 0 && (
                <button
                  onClick={() => alert('Download all functionality - will download all submissions as ZIP')}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Download All</span>
                  <span className="sm:hidden">All</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {session.locked && (
                <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
                  Locked
                </span>
              )}
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                {filteredSubmissions?.length || 0} Submissions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 mb-4">
        <form method="get" className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by teacher name..."
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold px-6 py-2 rounded-lg transition-colors min-h-[48px] flex items-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          {search && (
            <Link
              href={`/admin/sessions/${sessionId}`}
              className="bg-gray-300 hover:bg-gray-400 text-[#2E2815] font-semibold px-6 py-2 rounded-lg transition-colors min-h-[48px] flex items-center"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Submissions List */}
      <SubmissionsList
        submissions={filteredSubmissions || []}
        sessionId={sessionId}
      />
    </div>
  );
}
