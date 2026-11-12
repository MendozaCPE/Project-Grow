import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import FormComponent from "@/app/teacher/form/[sessionId]/FormComponent";
import type { LACFormAnswers } from "@/lib/lacForm4";

export default async function AdminViewSubmission({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const supabase = await createClient();
  const { submissionId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/teacher");

  // Fetch submission with teacher and session info
  const { data: submission } = await supabase
    .from("submissions")
    .select(
      `
      *,
      teacher:profiles!teacher_id (
        id,
        full_name,
        school
      ),
      lac_sessions (
        id,
        uuid,
        session_no,
        session_date,
        title,
        region,
        division,
        locked
      )
    `
    )
    .eq("id", submissionId)
    .single();

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FBF6E4] via-white to-[#F3DC94]/20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2E2815] mb-4">Submission Not Found</h1>
          <Link
            href="/admin?tab=sessions"
            className="text-[#E3B23C] hover:text-[#C9962A] font-semibold"
          >
            ← Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  const session = submission.lac_sessions;
  const teacher = submission.teacher;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF6E4] via-white to-[#F3DC94]/20">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Back Button */}
        <div className="mb-4">
          <Link
            href="/admin?tab=sessions"
            className="inline-flex items-center gap-2 text-[#E3B23C] hover:text-[#C9962A] font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Sessions
          </Link>
        </div>

        {/* Header with Teacher Info */}
        <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-12 h-12 bg-[#E3B23C] rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-[#2E2815]">
                {session?.session_no}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2E2815]">
                {session?.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#2E2815]/70">
                {session?.session_date && new Date(session.session_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Teacher Info */}
          <div className="border-t border-[#E3B23C]/20 pt-3 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-[#E3B23C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <span className="font-semibold text-[#2E2815]">{teacher?.full_name}</span>
                {teacher?.school && (
                  <span className="text-[#8B7E6A] ml-2">• {teacher.school}</span>
                )}
              </div>
            </div>
          </div>

          {/* Status Badges and Actions */}
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#E3B23C]/20 text-[#2E2815] text-xs font-semibold rounded-full">
                Admin View
              </span>
              {session?.locked && (
                <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
                  Locked
                </span>
              )}
              {submission && (
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    submission.status === "draft"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {submission.status === "draft" ? "Draft" : "Submitted"}
                </span>
              )}
            </div>

            {/* Download Button */}
            <a
              href={`/api/export/${submissionId}`}
              download
              className="flex items-center gap-2 px-3 py-1.5 bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] text-sm font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Download
            </a>
          </div>
        </div>

        {/* Form Component in Read-Only Mode */}
        <FormComponent
          sessionUuid={session?.uuid || ""}
          sessionId={session?.id || ""}
          sessionNo={session?.session_no || 0}
          sessionTitle={session?.title || ""}
          sessionDate={session?.session_date || ""}
          sessionRegion={session?.region}
          sessionDivision={session?.division}
          teacherName={teacher?.full_name || ""}
          isLocked={session?.locked || false}
          isViewMode={true}
          existingAnswers={submission.answers as LACFormAnswers}
          submissionId={submission.id}
          submissionStatus={submission.status}
        />
      </div>
    </div>
  );
}
