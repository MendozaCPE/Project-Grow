"use client";

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
                        className="bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        View
                      </Link>
                      <a
                        href={`/api/export/${submission.id}`}
                        download
                        className="bg-[#2B579A] hover:bg-[#1e3d6b] text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors"
                        title="Download Word"
                      >
                        Word
                      </a>
                      <a
                        href={`/api/export-pdf/${submission.id}`}
                        download
                        className="bg-[#D32F2F] hover:bg-[#9a0007] text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors"
                        title="Download PDF"
                      >
                        PDF
                      </a>
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
                  className="flex-1 bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold py-3 px-4 rounded-lg text-center text-sm transition-colors min-h-[48px] flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </Link>
                <a
                  href={`/api/export/${submission.id}`}
                  download
                  className="flex-1 bg-[#2B579A] hover:bg-[#1e3d6b] text-white font-semibold py-3 px-4 rounded-lg text-center text-sm transition-colors min-h-[48px] flex items-center justify-center"
                  title="Download Word"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Word
                </a>
                <a
                  href={`/api/export-pdf/${submission.id}`}
                  download
                  className="flex-1 bg-[#D32F2F] hover:bg-[#9a0007] text-white font-semibold py-3 px-4 rounded-lg text-center text-sm transition-colors min-h-[48px] flex items-center justify-center"
                  title="Download PDF"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
