"use client";

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

export default function SessionsList({ sessions, submissionMap }: SessionsListProps) {
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
          LAC sessions will appear here once your administrator creates them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const submission = submissionMap.get(session.id);
        let status: string;
        let statusColor: string;

        if (session.locked && !submission) {
          // Session is locked and teacher never submitted
          status = "Not Submitted (Locked)";
          statusColor = "bg-red-100 text-red-800";
        } else if (session.locked && submission?.status === "draft") {
          // Session is locked but only has a draft (not submitted)
          status = "Not Submitted (Locked)";
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
          // Session is open, has draft
          status = "Draft";
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
          <Link
            key={session.id}
            href={`/teacher/form/${session.id}`}
            className="block"
          >
            <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#E3B23C]/30 touch-manipulation">
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
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#2E2815]/70">
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
                </div>

                {/* Arrow Icon */}
                <div className="flex-shrink-0 text-[#E3B23C]">
                  <svg
                    className="w-6 h-6"
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
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
