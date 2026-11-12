import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardCard from "@/components/DashboardCard";
import Image from "next/image";
import DocumentsTab from "./DocumentsTab";
import SessionsTab from "./SessionsTab";
import SettingsTab from "./SettingsTab";

export default async function TeacherDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Fetch all LAC sessions
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

  const submittedForms = submissions?.filter((sub: any) => sub.status === "submitted") || [];
  const draftForms = submissions?.filter((sub: any) => sub.status === "draft") || [];
  
  // Count sessions with "Pending" badge status
  // Pending = open session (not locked) AND (not started OR has draft but not submitted)
  const pendingCount = sessions?.filter((session: any) => {
    const submission = submissions?.find((s: any) => s.session_id === session.id);
    // Pending if: session is open AND (no submission OR submission is draft)
    return !session.locked && (!submission || submission.status === "draft");
  }).length || 0;
  
  // Get latest session date
  const latestSession = sessions && sessions.length > 0 
    ? new Date(sessions[0].session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "No sessions yet";

  // Get the current tab from searchParams - await the promise
  const params = await searchParams;
  const currentTab = params.tab || "dashboard";

  // A session is "pending" when it is still open and the teacher has not submitted yet
  // (either no form started, or a draft saved)
  const isPendingSession = (session: any) => {
    const submission = submissions?.find((s: any) => s.session_id === session.id);
    return !session.locked && submission?.status !== "submitted";
  };

  // Prioritize pending sessions (open, not yet submitted) at the top, then sort by date
  const prioritizedSessions = sessions ? [...sessions].sort((a: any, b: any) => {
    const aIsPending = isPendingSession(a);
    const bIsPending = isPendingSession(b);
    
    // Prioritize pending sessions first
    if (aIsPending && !bIsPending) return -1;
    if (!aIsPending && bIsPending) return 1;
    
    // Then sort by date (most recent first)
    return new Date(b.session_date).getTime() - new Date(a.session_date).getTime();
  }) : [];

  // For dashboard: show all pending sessions + fill up to 3 with most recent
  const pendingSessions = prioritizedSessions.filter((s: any) => isPendingSession(s));
  const nonPendingSessions = prioritizedSessions.filter((s: any) => !isPendingSession(s));
  const dashboardSessions = [
    ...pendingSessions,
    ...nonPendingSessions.slice(0, Math.max(0, 3 - pendingSessions.length))
  ];

  // Render tab-specific content
  if (currentTab === "documents") {
    return <DocumentsTab submissions={submissions || []} />;
  }

  if (currentTab === "sessions") {
    return <SessionsTab sessions={sessions || []} submissions={submissions || []} />;
  }

  if (currentTab === "settings") {
    return <SettingsTab profile={{
      id: user.id,
      full_name: profile.full_name,
      email: user.email || "",
      school: profile.school,
      role: profile.role,
    }} />;
  }

  // Default Dashboard view
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#E3B23C] via-[#F3DC94] to-[#E3B23C] rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4" />
        
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-1">
            {/* Large Logo on the Left */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0">
              <Image
                src="/logo-2.png"
                alt="School Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Text Content */}
            <div className="flex-1">
              <p className="text-sm sm:text-base text-[#5C5037] font-medium mb-1">
                Welcome back,
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2E2815] mb-1">
                {profile.full_name}! 👋
              </h1>
              <p className="text-sm sm:text-base text-[#2E2815] font-semibold">
                {profile.school}
              </p>
            </div>
          </div>
          
          {/* Illustration */}
          <div className="hidden lg:block relative w-40 h-32">
            <div className="relative w-full h-full">
              <Image
                src="/logo-1.png"
                alt="Illustration"
                fill
                className="object-contain opacity-20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="LAC Sessions"
          value={sessions?.length || 0}
          trend="+1"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        
        <DashboardCard
          title="Pending"
          value={pendingCount}
          bgColor="bg-gradient-to-br from-blue-100 to-blue-50"
          iconColor="text-blue-500"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        
        <DashboardCard
          title="Submitted Forms"
          value={submittedForms.length}
          trend="+1"
          bgColor="bg-gradient-to-br from-green-100 to-emerald-50"
          iconColor="text-green-500"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <DashboardCard
          title="Latest Session"
          value={latestSession}
          bgColor="bg-gradient-to-br from-purple-100 to-purple-50"
          iconColor="text-purple-500"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#E3B23C] to-[#C9962A] rounded-full" />
            <h2 className="text-xl font-bold text-[#2E2815]">Recent Sessions</h2>
          </div>
          <Link
            href="/teacher?tab=sessions"
            className="text-sm font-semibold text-[#E3B23C] hover:text-[#C9962A] transition-colors flex items-center gap-1"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="space-y-3">
          {dashboardSessions?.map((session: any) => {
            const submission = submissions?.find((s: any) => s.session_id === session.id);
            const isLocked = session.locked;
            // Pending = open session that still needs to be submitted (not started or draft)
            const isOngoing = isPendingSession(session);
            
            let status: string;
            if (isLocked && submission?.status !== "submitted") {
              status = "Failed to Submit";
            } else if (!submission) {
              status = "Not Started";
            } else if (submission.status === "draft") {
              status = "Pending";
            } else {
              status = "Submitted";
            }
            
            return (
              <Link
                key={session.id}
                href={`/teacher/form/${session.id}`}
                className={`block p-4 rounded-xl border transition-all ${
                  isOngoing 
                    ? "bg-gradient-to-r from-[#FFF3CD] via-[#FFE69C] to-[#FFF3CD] border-[#FFC107] hover:border-[#E3B23C] hover:shadow-xl ring-2 ring-[#FFC107]/50 shadow-lg" 
                    : "bg-gradient-to-r from-[#FBF6E4] to-white border-[#E3B23C]/20 hover:border-[#E3B23C]/40 hover:shadow-md"
                }`}
              >
                {isOngoing && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#FFC107] text-[#2E2815] text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Pending - Submit Soon!
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
                    isOngoing 
                      ? "bg-gradient-to-br from-[#E3B23C] to-[#C9962A] animate-pulse" 
                      : "bg-gradient-to-br from-[#E3B23C] to-[#C9962A]"
                  }`}>
                    {session.session_no}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#2E2815] truncate">{session.title}</h3>
                    <p className="text-xs text-[#8B7E6A] mt-0.5">
                      <span className="font-semibold">Session Date:</span>{" "}
                      {new Date(session.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      status === "Submitted" ? "bg-green-100 text-green-700" :
                      status === "Pending" ? "bg-blue-100 text-blue-700" :
                      status === "Failed to Submit" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {status}
                    </span>
                    {isLocked && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* My Submitted Forms (Pending container removed) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-400 rounded-full" />
            <h2 className="text-xl font-bold text-[#2E2815]">My Submitted Forms</h2>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            {submittedForms.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {submittedForms.slice(0, 2).map((submission: any) => (
            <Link
              key={submission.id}
              href={`/teacher/form/${submission.session_id}`}
              className="block p-3 bg-green-50/50 rounded-xl border border-green-100 hover:border-green-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold">
                  {submission.lac_sessions?.session_no}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-[#2E2815] truncate">
                    {submission.lac_sessions?.title}
                  </h4>
                  <p className="text-xs text-[#8B7E6A]">
                    Submitted {new Date(submission.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
          
          {submittedForms.length === 0 && (
            <p className="text-sm text-[#8B7E6A] text-center py-8">
              No submissions yet. Complete a form to see it here!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}