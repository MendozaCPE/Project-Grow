"use client";

import { useState } from "react";
import Link from "next/link";

type Submission = {
  id: string;
  status: "draft" | "submitted";
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    school: string;
    email: string;
  };
};

type SubmissionsListProps = {
  submissions: Submission[];
  sessionId: string;
};

export default function SubmissionsList({
  submissions,
  sessionId,
}: SubmissionsListProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(submissionId));
    
    try {
      // Delete functionality to be implemented
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Delete functionality - to be implemented');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete submission');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };
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
          No Submissions Yet
        </h3>
        <p className="text-sm text-[#2E2815]/70">
          Teachers haven't submitted forms for this session yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop: Table View */}
      <div className="hidden lg:block bg-[#FFFDF5] rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#E3B23C]/20">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#2E2815]">
                Teacher
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#2E2815]">
                School
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#2E2815]">
                Status
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#2E2815]">
                Last Updated
              </th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-[#2E2815]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => {
              const formattedDate = new Date(
                submission.updated_at
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <tr
                  key={submission.id}
                  className="border-t border-gray-200"
                >
                  <td className="px-4 py-3 text-sm text-[#2E2815]">
                    {submission.profiles.full_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#2E2815]/70">
                    {submission.profiles.school}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Submitted
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#2E2815]/70">
                    {formattedDate}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/teacher/form/${sessionId}?view=true&admin=true&submissionId=${submission.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                        title="View Submission"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="hidden xl:inline">View</span>
                      </Link>
                      <a
                        href={`/api/export/${submission.id}`}
                        download
                        className="bg-[#2B579A] hover:bg-[#1e3d6b] text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                        title="Download Word"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden xl:inline">Download</span>
                      </a>
                      <button
                        onClick={() => handleDelete(submission.id)}
                        disabled={deletingIds.has(submission.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Submission"
                      >
                        {deletingIds.has(submission.id) ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="hidden xl:inline">Deleting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden xl:inline">Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet: Card View */}
      <div className="lg:hidden space-y-3">
        {submissions.map((submission) => {
          const formattedDate = new Date(
            submission.updated_at
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={submission.id}
              className="bg-[#FFFDF5] rounded-lg shadow-md p-4"
            >
              <div className="mb-3">
                <h3 className="text-base font-semibold text-[#2E2815] mb-1">
                  {submission.profiles.full_name}
                </h3>
                <p className="text-sm text-[#2E2815]/70 mb-2">
                  {submission.profiles.school}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#2E2815]/70">
                  <span>{formattedDate}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Submitted
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/teacher/form/${sessionId}?view=true&admin=true&submissionId=${submission.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center text-sm transition-colors min-h-[48px] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </Link>
                <a
                  href={`/api/export/${submission.id}`}
                  download
                  className="flex-1 bg-[#2B579A] hover:bg-[#1e3d6b] text-white font-semibold py-3 px-4 rounded-lg text-center text-sm transition-colors min-h-[48px] flex items-center justify-center gap-2"
                  title="Download Word"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </a>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleDelete(submission.id)}
                  disabled={deletingIds.has(submission.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg text-center text-sm transition-colors min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Submission"
                >
                  {deletingIds.has(submission.id) ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
