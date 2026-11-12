"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteSubmission } from "./actions";

type Submission = {
  id: string;
  session_id: string;
  status: "draft" | "submitted";
  updated_at: string;
  lac_sessions: {
    id: string;
    session_no: number;
    title: string;
    session_date: string;
    locked: boolean;
  };
};

type MySubmissionsProps = {
  submissions: Submission[];
  emptyMessage?: string;
};

export default function MySubmissions({ 
  submissions, 
  emptyMessage = "Your forms will appear here."
}: MySubmissionsProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (submissions.length === 0) {
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
          No Forms Yet
        </h3>
        <p className="text-sm text-[#2E2815]/70">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const handleDelete = async (submissionId: string) => {
    setDeletingId(submissionId);
    setError(null);
    
    try {
      const result = await deleteSubmission(submissionId);
      if (result.success) {
        // Force a hard refresh to update the UI
        router.refresh();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete submission:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete submission";
      setError(errorMessage);
      alert(`Failed to delete: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}
      
      {submissions.map((submission) => {
        const formattedDate = new Date(submission.updated_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const statusColor = submission.status === "draft"
          ? "bg-blue-100 text-blue-800"
          : "bg-green-100 text-green-800";

        const canEdit = !submission.lac_sessions.locked;

        return (
          <div
            key={submission.id}
            className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-5"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#E3B23C] rounded-lg flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold text-[#2E2815]">
                  {submission.lac_sessions.session_no}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-[#2E2815] mb-1 line-clamp-2">
                  {submission.lac_sessions.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#2E2815]/70">
                  <span>Updated {formattedDate}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}
                  >
                    {submission.status === "draft" ? "Draft" : "Submitted"}
                  </span>
                  {submission.lac_sessions.locked && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500 text-white">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Mobile: Stack, Desktop: Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* View Button */}
              <Link
                href={`/teacher/form/${submission.session_id}?view=true`}
                className="flex-1 sm:flex-none bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold py-3 px-4 rounded-lg text-center text-sm sm:text-base touch-manipulation transition-colors min-h-[48px] flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </Link>

              {/* Edit Button */}
              {canEdit ? (
                <Link
                  href={`/teacher/form/${submission.session_id}`}
                  className="flex-1 sm:flex-none bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold py-3 px-4 rounded-lg text-center text-sm sm:text-base touch-manipulation transition-colors min-h-[48px] flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              ) : (
                <button
                  disabled
                  className="flex-1 sm:flex-none bg-gray-300 text-gray-500 font-semibold py-3 px-4 rounded-lg text-center text-sm sm:text-base cursor-not-allowed min-h-[48px] flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Locked
                </button>
              )}

              {/* Download Word Button */}
              <a
                href={`/api/export/${submission.id}`}
                download
                className="flex-1 sm:flex-none bg-[#2B579A] hover:bg-[#1e3d6b] text-white font-semibold py-3 px-4 rounded-lg text-center text-sm sm:text-base touch-manipulation transition-colors min-h-[48px] flex items-center justify-center"
                title="Download as Word document"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </a>

              {/* Delete Button */}
              {canEdit && (
                <>
                  {showDeleteConfirm === submission.id ? (
                    <div className="flex-1 sm:flex-none flex gap-2">
                      <button
                        onClick={() => handleDelete(submission.id)}
                        disabled={deletingId === submission.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg text-sm sm:text-base touch-manipulation transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === submission.id ? "Deleting..." : "Confirm"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        disabled={deletingId === submission.id}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-[#2E2815] font-semibold py-3 px-4 rounded-lg text-sm sm:text-base touch-manipulation transition-colors min-h-[48px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(submission.id)}
                      className="flex-1 sm:flex-none bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-4 rounded-lg text-center text-sm sm:text-base touch-manipulation transition-colors min-h-[48px] flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
