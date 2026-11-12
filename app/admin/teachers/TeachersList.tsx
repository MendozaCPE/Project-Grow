"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toggleTeacherActive } from "../actions";

type Submission = {
  id: string;
  session_id: string;
  status: string;
  lac_sessions: {
    session_no: number;
    title: string;
  };
};

type Teacher = {
  id: string;
  full_name: string;
  school: string;
  email: string;
  active: boolean;
  created_at: string;
  submissionCount: number;
  submissions: Submission[];
};

type TeachersListProps = {
  teachers: Teacher[];
};

type StatusFilter = "all" | "active" | "inactive";

export default function TeachersList({ teachers }: TeachersListProps) {
  const router = useRouter();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Filter teachers based on search and status
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return teachers.filter((teacher) => {
      // Status filter
      if (statusFilter === "active" && !teacher.active) return false;
      if (statusFilter === "inactive" && teacher.active) return false;

      // Search query
      if (!q) return true;
      return (
        teacher.full_name.toLowerCase().includes(q) ||
        teacher.email.toLowerCase().includes(q) ||
        teacher.school.toLowerCase().includes(q)
      );
    });
  }, [teachers, query, statusFilter]);

  const activeCount = teachers.filter((t) => t.active).length;
  const inactiveCount = teachers.filter((t) => !t.active).length;

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All Teachers", count: teachers.length },
    { key: "active", label: "Active", count: activeCount },
    { key: "inactive", label: "Inactive", count: inactiveCount },
  ];

  const hasActiveFilters = query.trim() !== "" || statusFilter !== "all";

  const handleDownloadAllSubmissions = async () => {
    const allSubmissions = teachers.flatMap(t => t.submissions);
    
    if (allSubmissions.length === 0) {
      alert("No submissions available to download.");
      return;
    }

    if (!confirm(`Download all ${allSubmissions.length} submissions from all teachers?`)) {
      return;
    }

    try {
      for (const submission of allSubmissions) {
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
      console.error("Failed to download submissions:", error);
      alert("Failed to download submissions. Please try again.");
    }
  };

  const handleToggleActive = async (teacherId: string, currentActive: boolean) => {
    if (
      !confirm(
        `Are you sure you want to ${
          currentActive ? "deactivate" : "reactivate"
        } this teacher? ${
          currentActive
            ? "They will not be able to log in, but their forms will remain intact."
            : "They will be able to log in again."
        }`
      )
    ) {
      return;
    }

    setTogglingId(teacherId);
    try {
      await toggleTeacherActive(teacherId, !currentActive);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle active:", error);
      alert("Failed to update teacher status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDownloadTeacherSubmissions = async (teacher: Teacher) => {
    if (teacher.submissions.length === 0) {
      alert("No submissions available to download.");
      return;
    }

    try {
      for (const submission of teacher.submissions) {
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
      console.error("Failed to download submissions:", error);
      alert("Failed to download submissions. Please try again.");
    }
  };

  const totalSubmissions = teachers.reduce((sum, t) => sum + t.submissionCount, 0);

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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2E2815]">Manage Teachers</h1>
            <p className="text-sm text-[#5C5037]">
              View and manage all teacher accounts
            </p>
          </div>
        </div>
      </div>

      {/* All Teachers */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#E3B23C] to-[#C9962A] rounded-full" />
            <h2 className="text-xl font-bold text-[#2E2815]">All Teachers</h2>
          </div>
          <span className="px-3 py-1 bg-[#FBF6E4] text-[#8B7E6A] rounded-full text-sm font-semibold">
            {filtered.length} of {teachers.length}
          </span>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
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
              placeholder="Search by name, email, or school..."
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
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        {/* Download All Button */}
        {totalSubmissions > 0 && (
          <div className="mb-6">
            <button
              onClick={handleDownloadAllSubmissions}
              className="w-full bg-gradient-to-r from-[#E3B23C] to-[#C9962A] hover:from-[#C9962A] hover:to-[#B8851F] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Download All Submissions from All Teachers ({totalSubmissions})
            </button>
          </div>
        )}

        {/* Teachers List */}
        <div className="space-y-3">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-sm text-[#8B7E6A]">
                {teachers.length === 0
                  ? "No teachers found. Teachers will appear here once they register."
                  : "No teachers match your search."}
              </p>
              {hasActiveFilters && teachers.length > 0 && (
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

          {filtered.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Teacher Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2E2815] mb-1">
                      {teacher.full_name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-[#2E2815]/70 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="truncate">{teacher.school}</span>
                      </p>
                      <p className="text-sm text-[#2E2815]/70 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{teacher.email}</span>
                      </p>
                      <p className="text-sm text-[#2E2815]/70 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{teacher.submissionCount} submission{teacher.submissionCount !== 1 ? 's' : ''}</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    {teacher.active ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full whitespace-nowrap">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap sm:flex-col gap-2 sm:w-48">
                {teacher.submissionCount > 0 && (
                  <button
                    onClick={() => setSelectedTeacher(teacher)}
                    className="flex-1 sm:w-full bg-gradient-to-r from-[#E3B23C] to-[#C9962A] hover:from-[#C9962A] hover:to-[#B8851F] text-[#2E2815] font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Forms
                  </button>
                )}
                <button
                  onClick={() => handleToggleActive(teacher.id, teacher.active)}
                  disabled={togglingId === teacher.id}
                  className={`flex-1 sm:w-full ${
                    teacher.active
                      ? "bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700"
                      : "bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700"
                  } font-semibold py-2 px-4 rounded-lg text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {togglingId === teacher.id ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </>
                  ) : teacher.active ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Deactivate
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Reactivate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Submissions Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#2E2815]">
                  {selectedTeacher.full_name}'s Submissions
                </h3>
                <p className="text-sm text-[#2E2815]/70 mt-1">
                  {selectedTeacher.submissionCount} submission{selectedTeacher.submissionCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedTeacher.submissions.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTeacher.submissions.map((submission: any) => (
                    <div
                      key={submission.id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-[#E3B23C] rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-[#2E2815]">
                          {submission.lac_sessions.session_no}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#2E2815] mb-1">
                          {submission.lac_sessions.title}
                        </h4>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Submitted
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/view/${submission.id}`}
                          className="p-2 bg-gradient-to-r from-[#E3B23C] to-[#C9962A] hover:from-[#C9962A] hover:to-[#B8851F] text-[#2E2815] rounded-lg transition-all shadow-sm hover:shadow-md"
                          title="View Form"
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
            {selectedTeacher.submissions.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => handleDownloadTeacherSubmissions(selectedTeacher)}
                  className="flex-1 bg-gradient-to-r from-[#E3B23C] to-[#C9962A] hover:from-[#C9962A] hover:to-[#B8851F] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                  </svg>
                  Download All ({selectedTeacher.submissionCount})
                </button>
                <button
                  onClick={() => setSelectedTeacher(null)}
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
