"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleSessionLock } from "./actions";

type Teacher = {
  id: string;
  full_name: string;
  school: string;
};

type Submission = {
  id: string;
  status: "draft" | "submitted";
  teacher_id: string;
  teacher?: Teacher;
};

type Session = {
  id: string;
  session_no: number;
  session_date: string;
  title: string;
  locked: boolean;
  submissions: Submission[];
};

type SessionsListProps = {
  sessions: Session[];
};

export default function SessionsList({ sessions }: SessionsListProps) {
  const router = useRouter();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [togglingLock, setTogglingLock] = useState<string | null>(null);
  const [selectedSessionDocs, setSelectedSessionDocs] = useState<Session | null>(null);

  if (sessions.length === 0) {
    return (
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-6 sm:p-8 text-center">
        <div className="text-[#2E2815]/40 mb-2">
          <svg
            className="w-16 h-16 mx-auto mb-4"
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
        </div>
        <h3 className="text-lg font-semibold text-[#2E2815] mb-2">
          No LAC Sessions Yet
        </h3>
        <p className="text-sm text-[#2E2815]/70">
          Create your first LAC session using the form above.
        </p>
      </div>
    );
  }

  const handleToggleLock = async (sessionId: string, currentLocked: boolean) => {
    setTogglingLock(sessionId);
    try {
      await toggleSessionLock(sessionId, !currentLocked);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle lock:", error);
      alert("Failed to toggle lock. Please try again.");
    } finally {
      setTogglingLock(null);
    }
  };

  const handleDownloadAllDocuments = async (session: Session) => {
    const submittedDocs = session.submissions.filter(s => s.status === "submitted");
    
    if (submittedDocs.length === 0) {
      alert("No submitted documents available to download.");
      return;
    }

    try {
      for (const submission of submittedDocs) {
        const link = document.createElement("a");
        link.href = `/api/export/${submission.id}`;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("Failed to download documents:", error);
      alert("Failed to download documents. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const isExpanded = expandedSession === session.id;
        const formattedDate = new Date(session.session_date).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        );

        // Calculate submission stats (only count submitted forms)
        const submittedCount = session.submissions.filter(
          (s) => s.status === "submitted"
        ).length;

        return (
          <div
            key={session.id}
            className="bg-[#FFFDF5] rounded-lg shadow-md overflow-hidden"
          >
            {/* Session Header */}
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Session Number Badge */}
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-[#E3B23C] rounded-lg flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-bold text-[#2E2815]">
                    {session.session_no}
                  </span>
                </div>

                {/* Session Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2E2815] flex-1">
                      {session.title}
                    </h3>
                    <button
                      onClick={() =>
                        setExpandedSession(isExpanded ? null : session.id)
                      }
                      className="flex-shrink-0 text-[#E3B23C] hover:text-[#C9962A] p-2 -mt-2 -mr-2"
                    >
                      <svg
                        className={`w-6 h-6 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#2E2815]/70 mb-3">
                    <span className="flex items-center gap-1">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formattedDate}
                    </span>

                    {session.locked && (
                      <span className="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
                        Locked
                      </span>
                    )}

                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      {submittedCount} Submitted
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleToggleLock(session.id, session.locked)}
                      disabled={togglingLock === session.id}
                      className={`flex-1 sm:w-auto ${
                        session.locked
                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                      } text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg min-h-[48px] flex items-center justify-center touch-manipulation text-sm disabled:opacity-50`}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {session.locked ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        )}
                      </svg>
                      {togglingLock === session.id
                        ? "Updating..."
                        : session.locked
                        ? "Unlock Session"
                        : "Lock Session"}
                    </button>

                    {submittedCount > 0 && (
                      <button
                        onClick={() => setSelectedSessionDocs(session)}
                        className="flex-1 sm:w-auto bg-gradient-to-r from-[#E3B23C] to-[#C9962A] hover:from-[#C9962A] hover:to-[#B8851F] text-[#2E2815] font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg min-h-[48px] flex items-center justify-center touch-manipulation text-sm"
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        View All Documents
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded: Submissions List */}
            {isExpanded && (
              <div className="border-t-2 border-[#E3B23C]/20">
                <Link
                  href={`/admin/sessions/${session.id}`}
                  className="block p-4 sm:p-5 bg-gradient-to-r from-[#E3B23C]/10 via-[#E3B23C]/15 to-[#E3B23C]/10 hover:from-[#E3B23C]/20 hover:via-[#E3B23C]/25 hover:to-[#E3B23C]/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-semibold text-[#2E2815]">
                      View All Submissions ({submittedCount})
                    </span>
                    <svg
                      className="w-5 h-5 text-[#E3B23C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            )}
          </div>
        );
      })}

      {/* Documents Modal */}
      {selectedSessionDocs && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#2E2815]">
                  {selectedSessionDocs.title} - Submitted Documents
                </h3>
                <p className="text-sm text-[#2E2815]/70 mt-1">
                  Session {selectedSessionDocs.session_no} • {selectedSessionDocs.submissions.filter(s => s.status === "submitted").length} submitted
                </p>
              </div>
              <button
                onClick={() => setSelectedSessionDocs(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedSessionDocs.submissions.filter(s => s.status === "submitted").length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No submitted documents yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSessionDocs.submissions
                    .filter(s => s.status === "submitted")
                    .map((submission) => (
                      <div
                        key={submission.id}
                        className="bg-gray-50 rounded-lg p-4 flex items-center gap-4"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-[#E3B23C] rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#2E2815]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#2E2815] mb-1">
                            {submission.teacher?.full_name || "Unknown Teacher"}
                          </h4>
                          <p className="text-sm text-[#2E2815]/70">
                            {submission.teacher?.school || "No school info"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/view/${submission.id}`}
                            className="p-2 bg-gradient-to-r from-[#E3B23C] to-[#C9962A] hover:from-[#C9962A] hover:to-[#B8851F] text-[#2E2815] rounded-lg transition-all shadow-sm hover:shadow-md"
                            title="View Document"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <a
                            href={`/api/export/${submission.id}`}
                            download
                            className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
                            title="Download"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedSessionDocs.submissions.filter(s => s.status === "submitted").length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => handleDownloadAllDocuments(selectedSessionDocs)}
                  className="flex-1 bg-gradient-to-r from-[#E3B23C] to-[#C9962A] hover:from-[#C9962A] hover:to-[#B8851F] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                  </svg>
                  Download All ({selectedSessionDocs.submissions.filter(s => s.status === "submitted").length})
                </button>
                <button
                  onClick={() => setSelectedSessionDocs(null)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-[#2E2815] font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
