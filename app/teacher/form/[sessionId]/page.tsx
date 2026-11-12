import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FormComponent from "./FormComponent";
import DocumentView from "./DocumentView";
import DownloadButton from "./DownloadButton";
import type { LACFormAnswers } from "@/lib/lacForm4";

type PageProps = {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ view?: string; admin?: string; submissionId?: string }>;
};

export default async function FormPage({ params, searchParams }: PageProps) {
  const supabase = await createClient();
  const { sessionId } = await params;
  const { view, admin, submissionId } = await searchParams;
  const isViewMode = view === "true";
  const isAdminView = admin === "true";

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's profile to check role
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!userProfile) {
    redirect("/login");
  }

  const isAdmin = userProfile.role === "admin";

  // Fetch the session
  const { data: session, error: sessionError } = await supabase
    .from("lac_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    redirect(isAdmin ? "/admin" : "/teacher");
  }

  // Fetch submission
  let submission;
  let teacherProfile = userProfile;

  if (isAdminView && submissionId && isAdmin) {
    // Admin viewing specific submission
    const { data } = await supabase
      .from("submissions")
      .select(
        `
        *,
        profiles!submissions_teacher_id_fkey (
          full_name
        )
      `
      )
      .eq("id", submissionId)
      .single();

    submission = data;
    if (submission) {
      teacherProfile = {
        ...userProfile,
        full_name: submission.profiles.full_name,
      };
    }
  } else {
    // Regular user or teacher viewing their own
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("teacher_id", user.id)
      .eq("session_id", sessionId)
      .single();

    submission = data;
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-2 text-[#E3B23C] hover:text-[#C9962A] font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-shrink-0 w-12 h-12 bg-[#E3B23C] rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-[#2E2815]">
              {session.session_no}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2E2815]">
                  {session.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#2E2815]/70">
                  {new Date(session.session_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              {/* Download Button in Header */}
              {submission?.id && (
                <div className="flex-shrink-0">
                  <DownloadButton submissionId={submission.id} className="!py-2 !px-4 text-sm" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {isAdminView && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
              Admin View
            </span>
          )}
          {isViewMode && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              View Mode
            </span>
          )}
          {session.locked && (
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
      </div>

      {/* Form Component - Locked sessions cannot be submitted */}
      <FormComponent
        sessionUuid={sessionId}
        sessionId={session.session_id}
        sessionNo={session.session_no}
        sessionTitle={session.title}
        sessionDate={session.session_date}
        sessionRegion={session.region}
        sessionDivision={session.division}
        teacherName={teacherProfile.full_name}
        isLocked={session.locked}
        isViewMode={isAdminView}
        existingAnswers={submission?.answers as LACFormAnswers}
        submissionId={submission?.id}
        submissionStatus={submission?.status}
      />
    </div>
  );
}
