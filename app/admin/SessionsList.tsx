"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleSessionLock } from "./actions";

type Submission = {
  id: string;
  status: "draft" | "submitted";
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

                  {/* Lock/Unlock Button */}
                  <button
                    onClick={() => handleToggleLock(session.id, session.locked)}
                    disabled={togglingLock === session.id}
                    className={`w-full sm:w-auto ${
                      session.locked
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-orange-600 hover:bg-orange-700"
                    } text-white font-semibold py-2 px-4 rounded-lg transition-colors min-h-[48px] flex items-center justify-center touch-manipulation text-sm disabled:opacity-50`}
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
                </div>
              </div>
            </div>

            {/* Expanded: Submissions List */}
            {isExpanded && (
              <div className="border-t-2 border-[#E3B23C]/20">
                <Link
                  href={`/admin/sessions/${session.id}`}
                  className="block p-4 sm:p-5 bg-[#E3B23C]/10 hover:bg-[#E3B23C]/20 transition-colors"
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
    </div>
  );
}
