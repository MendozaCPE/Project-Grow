import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import DashboardCard from "@/components/DashboardCard";
import CreateSessionForm from "./CreateSessionForm";
import SessionsList from "./SessionsList";
import SessionCard from "./SessionCard";
import LACSessionsTab from "./LACSessionsTab";
import SettingsTab from "./SettingsTab";

const fmtDate = (d: string, withYear = true) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();

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

  // ---------- Data ----------
  const { count: teacherCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "teacher")
    .eq("active", true);

  // Fetch all active teachers for assignment selection
  const { data: allTeachers } = await supabase
    .from("profiles")
    .select("id, full_name, school")
    .eq("role", "teacher")
    .eq("active", true)
    .order("full_name");

  const { data: sessions } = await supabase
    .from("lac_sessions")
    .select(
      `
      *,
      submissions!submissions_session_id_fkey (
        id,
        status,
        deleted_at,
        teacher_id,
        teacher:profiles!teacher_id (
          id,
          full_name,
          school
        )
      )
    `
    )
    .order("session_date", { ascending: false });

  // Latest submitted forms with teacher + session info
  const { data: recentSubmissions } = await supabase
    .from("submissions")
    .select(
      `
      id,
      status,
      updated_at,
      session_id,
      teacher:profiles!teacher_id ( full_name, school ),
      lac_sessions ( session_no, title )
    `
    )
    .eq("status", "submitted")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(5);

  // ---------- Derived stats ----------
  const allSessions: any[] = sessions || [];
  const liveSubs = (s: any) =>
    (s.submissions || []).filter((x: any) => !x.deleted_at);

  const totalSubmitted = allSessions.reduce(
    (n, s) => n + liveSubs(s).filter((x: any) => x.status === "submitted").length,
    0
  );
  const totalDrafts = allSessions.reduce(
    (n, s) => n + liveSubs(s).filter((x: any) => x.status === "draft").length,
    0
  );
  const openSessions = allSessions.filter((s) => !s.locked);
  const lockedCount = allSessions.length - openSessions.length;
  const teachers = teacherCount || 0;
  const latestSession = allSessions[0]
    ? fmtDate(allSessions[0].session_date)
    : "No sessions yet";

  const overallRate =
    teachers > 0 && allSessions.length > 0
      ? Math.round((totalSubmitted / (teachers * allSessions.length)) * 100)
      : 0;

  // Sessions shown on the dashboard: only ongoing (not locked) sessions
  const featured = allSessions.filter((s) => !s.locked).slice(0, 4);

  // Get the current tab from searchParams
  const params = await searchParams;
  const currentTab = params.tab || "dashboard";

  // Render Settings tab
  if (currentTab === "settings") {
    // Fetch auth user email
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users.find(u => u.id === user.id);
    
    return (
      <SettingsTab 
        profile={{
          id: profile.id,
          full_name: profile.full_name,
          email: authUser?.email || "No email found",
          school: profile.school || "",
          role: profile.role,
        }}
      />
    );
  }

  // Render LAC Sessions tab
  if (currentTab === "sessions") {
    return (
      <LACSessionsTab
        sessions={allSessions}
        teachers={allTeachers || []}
        teacherCount={teachers}
      />
    );
  }

  // Default Dashboard view

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#E3B23C] via-[#F3DC94] to-[#E3B23C] rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex-shrink-0">
              <Image
                src="/logo-2.png"
                alt="School Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base text-[#5C5037] font-medium mb-1">
                Welcome back,
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2E2815] mb-1 truncate">
                {profile.full_name}! 👋
              </h1>
              <p className="text-sm sm:text-base text-[#2E2815] font-semibold">
                Admin Dashboard
                {profile.school ? ` • ${profile.school}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/admin/teachers"
              className="bg-gradient-to-r from-[#2E2815] to-[#443B20] hover:from-[#443B20] hover:to-[#5C5037] text-white font-semibold py-3 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all min-h-[48px] flex items-center justify-center gap-2 touch-manipulation text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Teachers
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Active Teachers"
          value={teachers}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        <DashboardCard
          title="LAC Sessions"
          value={allSessions.length}
          bgColor="bg-gradient-to-br from-blue-100 to-blue-50"
          iconColor="text-blue-500"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        <DashboardCard
          title="Total Submissions"
          value={totalSubmitted}
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
          bgColor="bg-gradient-to-br from-yellow-100 to-yellow-50"
          iconColor="text-yellow-600"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Create Session */}
      <div id="create-session" className="bg-white rounded-2xl p-4 sm:p-6 shadow-md scroll-mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#E3B23C] to-[#C9962A] rounded-full" />
            <h2 className="text-xl font-bold text-[#2E2815]">Deploy New Feedback Form</h2>
          </div>
          <CreateSessionForm teachers={allTeachers || []} />
        </div>
      </div>

      {/* Overview + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Overview */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-8 bg-gradient-to-b from-[#E3B23C] to-[#C9962A] rounded-full" />
            <h2 className="text-xl font-bold text-[#2E2815]">Overview</h2>
          </div>

          <div className="mb-5">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-semibold text-[#5C5037]">
                Overall completion
              </span>
              <span className="text-2xl font-bold text-[#2E2815]">
                {overallRate}%
              </span>
            </div>
            <div className="h-3 bg-[#FBF6E4] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E3B23C] to-[#C9962A] rounded-full"
                style={{ width: `${Math.min(overallRate, 100)}%` }}
              />
            </div>
            <p className="text-xs text-[#8B7E6A] mt-2">
              {totalSubmitted} of {teachers * allSessions.length} expected forms submitted
            </p>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50/60 border border-green-100">
              <dt className="font-medium text-[#2E2815]">Submitted</dt>
              <dd className="px-3 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                {totalSubmitted}
              </dd>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFF3CD]/60 border border-[#FFC107]/40">
              <dt className="font-medium text-[#2E2815]">Ongoing sessions</dt>
              <dd className="px-3 py-0.5 rounded-full bg-[#FFC107]/60 text-[#2E2815] text-xs font-semibold">
                {openSessions.length}
              </dd>
            </div>
          </dl>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-400 rounded-full" />
              <h2 className="text-xl font-bold text-[#2E2815]">Recent Submissions</h2>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {totalSubmitted}
            </span>
          </div>

          <div className="space-y-3">
            {(recentSubmissions || []).map((sub: any) => (
              <Link
                key={sub.id}
                href={`/admin/sessions/${sub.session_id}`}
                className="block p-3 bg-green-50/50 rounded-xl border border-green-100 hover:border-green-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold">
                    {sub.lac_sessions?.session_no}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-[#2E2815] truncate">
                      {sub.teacher?.full_name || "Unknown teacher"}
                    </h4>
                    <p className="text-xs text-[#8B7E6A] truncate">
                      {sub.teacher?.school ? `${sub.teacher.school} • ` : ""}
                      {sub.lac_sessions?.title}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#8B7E6A]">
                      {fmtDate(sub.updated_at, false)}
                    </p>
                    <span className="text-xs font-semibold text-green-600">
                      View details
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {(!recentSubmissions || recentSubmissions.length === 0) && (
              <p className="text-sm text-[#8B7E6A] text-center py-8">
                No submissions yet. They will appear here once teachers submit.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ongoing Session Progress */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#E3B23C] to-[#C9962A] rounded-full" />
            <h2 className="text-xl font-bold text-[#2E2815]">Ongoing Session Progress</h2>
          </div>
          <Link
            href="/admin?tab=sessions"
            className="text-sm font-semibold text-[#E3B23C] hover:text-[#C9962A] transition-colors flex items-center gap-1"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="space-y-3">
          {featured.map((session: any) => {
            const subs = liveSubs(session);
            const submitted = subs.filter((x: any) => x.status === "submitted").length;
            const drafts = subs.filter((x: any) => x.status === "draft").length;
            const notStarted = Math.max(teachers - submitted - drafts, 0);

            return (
              <SessionCard
                key={session.id}
                session={session}
                submitted={submitted}
                notStarted={notStarted}
                teachers={teachers}
                formattedDate={fmtDate(session.session_date)}
              />
            );
          })}

          {featured.length === 0 && (
            <p className="text-sm text-[#8B7E6A] text-center py-8">
              No ongoing sessions. Create a new session to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}