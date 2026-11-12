"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Session = {
  id: string;
  session_no: number;
  title: string;
  session_date: string;
  locked: boolean;
};

type Submission = {
  id: string;
  session_id: string;
  status: "draft" | "submitted";
  updated_at: string;
};

type SessionsTabProps = {
  sessions: Session[];
  submissions: Submission[];
};

type StatusFilter = "all" | "submitted" | "pending" | "notStarted" | "failedToSubmit";
type SortOrder = "newest" | "oldest" | "session";

export default function SessionsTab({ sessions, submissions }: SessionsTabProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const router = useRouter();

  const getSessionStatus = (session: Session) => {
    const submission = submissions?.find((s) => s.session_id === session.id);
    const isLocked = session.locked;
    
    let status: string;
    let statusColor: string;
    
    if (!submission) {
      status = "Not Started";
      statusColor = "bg-gray-100 text-gray-700";
    } else if (submission.status === "draft") {
      status = isLocked ? "Failed to Submit" : "Pending";
      statusColor = isLocked ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700";
    } else {
      status = "Submitted";
      statusColor = "bg-green-100 text-green-700";
    }
    
    return { status, statusColor, submission };
  };

  // Calculate status counts
  const statusCounts = useMemo(() => {
    let submitted = 0;
    let pending = 0;
    let notStarted = 0;
    let failedToSubmit = 0;

    sessions.forEach((session) => {
      const submission = submissions?.find((s) => s.session_id === session.id);
      
      if (!submission) {
        notStarted++;
      } else if (submission.status === "draft") {
        if (session.locked) {
          failedToSubmit++;
        } else {
          pending++;
        }
      } else {
        submitted++;
      }
    });

    return { submitted, pending, notStarted, failedToSubmit };
  }, [sessions, submissions]);

  // Filter and sort sessions
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = sessions.filter((s) => {
      const submission = submissions?.find((sub) => sub.session_id === s.id);
      
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "submitted") {
          if (!submission || submission.status !== "submitted") return false;
        } else if (statusFilter === "pending") {
          if (!submission || submission.status !== "draft" || s.locked) return false;
        } else if (statusFilter === "notStarted") {
          if (submission) return false;
        } else if (statusFilter === "failedToSubmit") {
          if (!s.locked || !submission || submission.status !== "draft") return false;
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
  }, [sessions, submissions, query, statusFilter, sortOrder]);

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All Sessions", count: sessions.length },
    { key: "submitted", label: "Submitted", count: statusCounts.submitted },
    { key: "pending", label: "Pending", count: statusCounts.pending },
    { key: "notStarted", label: "Not Started", count: statusCounts.notStarted },
    { key: "failedToSubmit", label: "Failed", count: statusCounts.failedToSubmit },
  ];

  const hasActiveFilters = query.trim() !== "" || statusFilter !== "all";

  const handleOpenModal = (session: Session) => {
    setSelectedSession(session);
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
  };

  const handleGoToForm = () => {
    if (selectedSession) {
      router.push(`/teacher/form/${selectedSession.id}`);
    }
  };

  const selectedSessionDetails = selectedSession ? getSessionStatus(selectedSession) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Session Details Modal */}
      {selectedSession && selectedSessionDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E3B23C] to-[#C9962A] rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {selectedSession.session_no}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2E2815] mb-1">
                    Session {selectedSession.session_no}
                  </h2>
                  <p className="text-sm text-[#8B7E6A]">LAC Session Details</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
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
            </div>

            {/* Session Information */}
            <div className="space-y-4 mb-6">
              {/* Title */}
              <div className="bg-[#FFFDF5] rounded-lg p-4 border-2 border-[#E3B23C]/30">
                <label className="text-xs font-semibold text-[#8B7E6A] uppercase mb-1 block">
                  Session Title
                </label>
                <p className="text-lg font-semibold text-[#2E2815]">
                  {selectedSession.title}
                </p>
              </div>

              {/* Session Date */}
              <div className="bg-[#FFFDF5] rounded-lg p-4 border-2 border-[#E3B23C]/30">
                <label className="text-xs font-semibold text-[#8B7E6A] uppercase mb-1 block">
                  Session Date
                </label>
                <p className="text-lg font-semibold text-[#2E2815] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#E3B23C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(selectedSession.session_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Status */}
              <div className="bg-[#FFFDF5] rounded-lg p-4 border-2 border-[#E3B23C]/30">
                <label className="text-xs font-semibold text-[#8B7E6A] uppercase mb-2 block">
                  Your Status
                </label>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedSessionDetails.statusColor}`}>
                    {selectedSessionDetails.status}
                  </span>
                  {selectedSession.locked && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm font-medium">Session Locked</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submission Details */}
              {selectedSessionDetails.submission && (
                <div className="bg-[#FFFDF5] rounded-lg p-4 border-2 border-[#E3B23C]/30">
                  <label className="text-xs font-semibold text-[#8B7E6A] uppercase mb-1 block">
                    Last Updated
                  </label>
                  <p className="text-sm text-[#2E2815]">
                    {new Date(selectedSessionDetails.submission.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {/* Status Message */}
              {selectedSessionDetails.status === "Pending" && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-blue-900 font-semibold mb-1">Action Required</h4>
                      <p className="text-blue-800 text-sm">
                        You have a draft saved. Please complete and submit your form.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedSessionDetails.status === "Failed to Submit" && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h4 className="text-red-900 font-semibold mb-1">Submission Closed</h4>
                      <p className="text-red-800 text-sm">
                        This session is now locked. You can still view and download your draft, but cannot submit it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedSessionDetails.status === "Submitted" && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-green-900 font-semibold mb-1">Successfully Submitted</h4>
                      <p className="text-green-800 text-sm">
                        Your form has been submitted. You can still edit it anytime.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedSessionDetails.status === "Not Started" && (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <h4 className="text-gray-900 font-semibold mb-1">Ready to Start</h4>
                      <p className="text-gray-800 text-sm">
                        Click the button below to begin filling out the LAC Form 4 for this session.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleGoToForm}
                className="flex-1 bg-[#E3B23C] hover:bg-[#D4A02C] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {selectedSessionDetails.status === "Not Started" ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Start Form
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Form
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#E3B23C] to-[#C9962A] rounded-full" />
            <h2 className="text-2xl font-bold text-[#2E2815]">LAC Sessions</h2>
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

        {/* Sessions List */}
        {filtered.length === 0 ? (
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
                ? "No LAC sessions available yet."
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
            const { status, statusColor } = getSessionStatus(session);
            const isPending = status === "Pending";

            return (
              <button
                key={session.id}
                onClick={() => handleOpenModal(session)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isPending
                    ? "bg-gradient-to-r from-[#FFF3CD] via-[#FFE69C] to-[#FFF3CD] border-[#FFC107] hover:border-[#E3B23C] hover:shadow-xl ring-2 ring-[#FFC107]/50 shadow-lg"
                    : "bg-gradient-to-r from-[#FBF6E4] to-white border-[#E3B23C]/20 hover:border-[#E3B23C]/40 hover:shadow-md"
                }`}
              >
                {isPending && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-[#FFC107] text-[#2E2815] text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      ⚠️ Pending - Submit Soon!
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#E3B23C] to-[#C9962A] rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                    {session.session_no}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#2E2815] truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-[#8B7E6A] mt-0.5">
                      <span className="font-semibold">Session Date:</span>{" "}
                      {new Date(session.session_date).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                    >
                      {status}
                    </span>
                    {session.locked && (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
