"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Session = {
  id: string;
  session_no: number;
  session_date: string;
  title: string;
  locked: boolean;
};

type Submission = {
  id: string;
  session_id: string;
  status: "draft" | "submitted";
};

type SessionsListProps = {
  sessions: Session[];
  submissionMap: Map<string, Submission>;
};

type StatusFilter = "all" | "submitted" | "pending" | "notStarted" | "failedToSubmit";
type SortOrder = "newest" | "oldest" | "session";

export default function SessionsList({ sessions, submissionMap }: SessionsListProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // Calculate status counts
  const statusCounts = useMemo(() => {
    let submitted = 0;
    let pending = 0;
    let notStarted = 0;
    let failedToSubmit = 0;

    sessions.forEach((session) => {
      const submission = submissionMap.get(session.id);
      
      if (session.locked && !submission) {
        failedToSubmit++;
      } else if (session.locked && submission?.status === "draft") {
        failedToSubmit++;
      } else if (submission?.status === "submitted") {
        submitted++;
      } else if (submission?.status === "draft") {
        pending++;
      } else {
        notStarted++;
      }
    });

    return { submitted, pending, notStarted, failedToSubmit };
  }, [sessions, submissionMap]);

  // Filter and sort sessions
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = sessions.filter((s) => {
      const submission = submissionMap.get(s.id);
      
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "submitted" && submission?.status !== "submitted") return false;
        if (statusFilter === "pending" && (!submission || submission.status !== "draft" || s.locked)) return false;
        if (statusFilter === "notStarted" && (submission || s.locked)) return false;
        if (statusFilter === "failedToSubmit") {
          const isFailed = (s.locked && !submission) || (s.locked && submission?.status === "draft");
          if (!isFailed) return false;
        }
      }

      // Search query
      if (!q) return true;
      const title = s.title?.toLowerCase() || "";
      const no = String(s.session_no ?? "");
      return (
        title.includes(q) ||
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
  }, [sessions, submissionMap, query, statusFilter, sortOrder]);

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All Sessions", count: sessions.length },
    { key: "submitted", label: "Submitted", count: statusCounts.submitted },
    { key: "pending", label: "Pending", count: statusCounts.pending },
    { key: "notStarted", label: "Not Started", count: statusCounts.notStarted },
    { key: "failedToSubmit", label: "Failed", count: statusCounts.failedToSubmit },
  ];

  const hasActiveFilters = query.trim() !== "" || statusFilter !== "all";

  if (sessions.length === 0) {
    return (
      <div className="card p-8 sm:p-12 text-center animate-fade-in">
        <div className="inline-block p-6 bg-[#E3B23C]/10 rounded-full mb-4">
          <svg
            className="w-16 h-16 text-[#E3B23C] mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[#2E2815] mb-2">
          No LAC Sessions Yet
        </h3>
        <p className="text-sm text-[#8B7E6A]">
          LAC sessions will appear here once your administrator creates them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#2E2815]">My Sessions</h3>
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
              placeholder="Search by session title or number"
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
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                aria-pressed={active}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${
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
      </div>

      {/* Sessions List */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm text-[#8B7E6A]">
            {sessions.length === 0
              ? "No LAC sessions yet. LAC sessions will appear here once your administrator creates them."
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
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => {
        const submission = submissionMap.get(session.id);
        let status: string;
        let statusColor: string;

        if (session.locked && !submission) {
          // Session is locked and teacher never submitted
          status = "Failed to Submit";
          statusColor = "bg-red-100 text-red-800";
        } else if (session.locked && submission?.status === "draft") {
          // Session is locked but only has a draft (not submitted)
          status = "Failed to Submit";
          statusColor = "bg-red-100 text-red-800";
        } else if (session.locked && submission?.status === "submitted") {
          // Session is locked and was submitted
          status = "Submitted (Locked)";
          statusColor = "bg-gray-500 text-white";
        } else if (!submission) {
          // Session is open, not started
          status = "Not Started";
          statusColor = "bg-gray-200 text-gray-700";
        } else if (submission.status === "draft") {
          // Session is open, has draft - show as Pending
          status = "Pending";
          statusColor = "bg-blue-100 text-blue-800";
        } else {
          // Session is open, submitted
          status = "Submitted";
          statusColor = "bg-green-100 text-green-800";
        }

        const formattedDate = new Date(session.session_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <div
            key={session.id}
            className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#E3B23C]/30 touch-manipulation"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Session Number Badge */}
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-[#E3B23C] rounded-lg flex items-center justify-center">
                <span className="text-lg sm:text-xl font-bold text-[#2E2815]">
                  {session.session_no}
                </span>
              </div>

              {/* Session Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-[#2E2815] line-clamp-2">
                    {session.title}
                  </h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#2E2815]/70 mb-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formattedDate}
                  </span>
                  
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                  >
                    {status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/teacher/form/${session.id}`}
                    className="flex-1 min-w-[100px] bg-gradient-to-r from-[#E3B23C] to-[#C9962A] hover:from-[#C9962A] hover:to-[#B8851F] text-white text-center py-2 px-4 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </Link>
                  
                  {submission && (
                    <>
                      <a
                        href={`/api/export/${submission.id}`}
                        download
                        className="flex-1 min-w-[100px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
        </div>
      )}
    </div>
  );
}
