"use client";

import { useMemo, useState } from "react";
import CreateSessionForm from "./CreateSessionForm";
import SessionCardExpanded from "./SessionCardExpanded";

type Teacher = {
  id: string;
  full_name: string;
  school: string | null;
};

type Submission = {
  id: string;
  status: string;
  deleted_at: string | null;
  teacher_id: string;
  teacher: {
    id: string;
    full_name: string;
    school: string;
  } | null;
};

type Session = {
  id: string;
  session_id: string;
  session_no: number;
  session_date: string;
  title: string;
  region: string;
  division: string;
  locked: boolean;
  send_to_all: boolean;
  assigned_teachers: string[];
  submissions: Submission[];
};

type LACSessionsTabProps = {
  sessions: Session[];
  teachers: Teacher[];
  teacherCount: number;
};

type StatusFilter = "all" | "open" | "locked";
type SortOrder = "newest" | "oldest" | "session";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function LACSessionsTab({
  sessions,
  teachers,
  teacherCount,
}: LACSessionsTabProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const liveSubs = (s: Session) =>
    (s.submissions || []).filter((x) => !x.deleted_at);

  const openCount = sessions.filter((s) => !s.locked).length;
  const lockedCount = sessions.filter((s) => s.locked).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = sessions.filter((s) => {
      // Status filter
      if (statusFilter === "open" && s.locked) return false;
      if (statusFilter === "locked" && !s.locked) return false;

      // Search query
      if (!q) return true;
      const title = s.title?.toLowerCase() || "";
      const sessionId = s.session_id?.toLowerCase() || "";
      const no = String(s.session_no ?? "");
      return (
        title.includes(q) ||
        sessionId.includes(q) ||
        no.includes(q) ||
        `session ${no}`.includes(q)
      );
    });

    return list.sort((a, b) => {
      if (sortOrder === "session") {
        return a.session_no - b.session_no;
      }
      const diff =
        new Date(a.session_date).getTime() - new Date(b.session_date).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });
  }, [sessions, query, statusFilter, sortOrder]);

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All Sessions", count: sessions.length },
    { key: "open", label: "Open", count: openCount },
    { key: "locked", label: "Locked", count: lockedCount },
  ];

  const hasActiveFilters = query.trim() !== "" || statusFilter !== "all";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FFF3CD] via-[#FFE69C] to-[#FFF3CD] rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-[#E3B23C] rounded-xl flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2E2815]">LAC Session Documents</h1>
            <p className="text-sm text-[#5C5037]">
              Manage all Learning Action Cell sessions
            </p>
          </div>
        </div>
      </div>

      {/* All Sessions */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#E3B23C] to-[#C9962A] rounded-full" />
            <h2 className="text-xl font-bold text-[#2E2815]">All Sessions</h2>
          </div>
          <span className="px-3 py-1 bg-[#FBF6E4] text-[#8B7E6A] rounded-full text-sm font-semibold">
            {filtered.length} of {sessions.length}
          </span>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-[#8B7E6A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by session title, ID, or number"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#E3B23C]/30 bg-[#FBF6E4]/50 text-sm text-[#2E2815] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#E3B23C]/50 focus:border-[#E3B23C]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8B7E6A] hover:bg-[#E3B23C]/20 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            aria-label="Sort sessions"
            className="py-2.5 px-3 rounded-xl border border-[#E3B23C]/30 bg-[#FBF6E4]/50 text-sm font-medium text-[#2E2815] focus:outline-none focus:ring-2 focus:ring-[#E3B23C]/50 focus:border-[#E3B23C]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="session">Session number</option>
          </select>
        </div>

        {/* Status filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {filters.map((f) => {
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                aria-pressed={active}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${
                  active
                    ? "bg-[#E3B23C] text-[#2E2815] border-[#E3B23C]"
                    : "bg-white text-[#5C5037] border-[#E3B23C]/30 hover:border-[#E3B23C]/60"
                }`}
              >
                {f.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    active ? "bg-white/40" : "bg-[#FBF6E4] text-[#8B7E6A]"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filtered.map((session) => {
            const subs = liveSubs(session);
            const submitted = subs.filter((x) => x.status === "submitted")
              .length;
            const drafts = subs.filter((x) => x.status === "draft").length;
            const notStarted = Math.max(teacherCount - submitted - drafts, 0);

            return (
              <SessionCardExpanded
                key={session.id}
                session={session}
                submitted={submitted}
                notStarted={notStarted}
                teachers={teachers}
                teacherCount={teacherCount}
                formattedDate={fmtDate(session.session_date)}
              />
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-10">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-[#8B7E6A]">
                {sessions.length === 0
                  ? "No LAC sessions yet. Create your first session to get started!"
                  : "No sessions match your search."}
              </p>
              {hasActiveFilters && sessions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-3 text-sm font-semibold text-[#E3B23C] hover:text-[#C9962A] transition-colors"
                >
                  Clear search and filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
