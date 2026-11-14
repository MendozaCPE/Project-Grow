"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleSessionLock, deleteSession } from "./actions";
import EditSessionModal from "./EditSessionModal";

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

type SessionCardExpandedProps = {
  session: Session;
  submitted: number;
  notStarted: number;
  teachers: Teacher[];
  teacherCount: number;
  formattedDate: string;
};

export default function SessionCardExpanded({
  session,
  submitted,
  notStarted,
  teachers,
  teacherCount,
  formattedDate,
}: SessionCardExpandedProps) {
  const [isLocking, setIsLocking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"teachers" | "edit">("teachers");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const pct = teacherCount > 0 ? Math.round((submitted / teacherCount) * 100) : 0;
  const isOpen = !session.locked;

  const handleLock = async () => {
    setShowModal(true);
  };

  const confirmLock = async () => {
    const action = isOpen ? "lock" : "unlock";
    setShowModal(false);
    setIsLocking(true);
    try {
      await toggleSessionLock(session.id, !isOpen);
      window.location.reload();
    } catch (error) {
      alert(`Failed to ${action} session. Please try again.`);
      setIsLocking(false);
    }
  };

  const handleDownloadAll = async () => {
    const submittedDocs = submittedTeachers.map(t => submissionMap.get(t.id)).filter(Boolean);
    
    if (submittedDocs.length === 0) {
      alert("No submitted documents available to download.");
      return;
    }

    try {
      for (const submission of submittedDocs) {
        const link = document.createElement("a");
        link.href = `/api/export/${submission!.id}`;
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

  const handleDeleteSession = async () => {
    setIsDeleting(true);
    try {
      await deleteSession(session.id);
      setShowDeleteModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete session:", error);
      alert("Failed to delete session. Please try again.");
      setIsDeleting(false);
    }
  };

  // Create a map of teacher submissions
  const submissionMap = new Map(
    session.submissions
      ?.filter((s) => !s.deleted_at)
      .map((s) => [s.teacher_id, s])
  );

  // Get list of teachers who should see this session
  const assignedTeachersList = session.send_to_all
    ? teachers
    : teachers.filter((t) => session.assigned_teachers?.includes(t.id));

  // Categorize teachers
  const submittedTeachers = assignedTeachersList.filter((t) => {
    const sub = submissionMap.get(t.id);
    return sub?.status === "submitted";
  });

  const notSubmittedTeachers = assignedTeachersList.filter((t) => {
    const sub = submissionMap.get(t.id);
    return !sub || sub.status !== "submitted";
  });

  return (
    <div
      className={`rounded-xl border transition-all ${
        isOpen
          ? "bg-gradient-to-r from-[#FFF3CD] via-[#FFE69C] to-[#FFF3CD] border-[#FFC107] shadow-lg"
          : "bg-gradient-to-r from-[#FBF6E4] to-white border-[#E3B23C]/20 hover:border-[#E3B23C]/40 hover:shadow-md"
      }`}
    >
      <div className="p-4">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-start gap-3 mb-3">
            {/* Session Number Badge */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#E3B23C] to-[#C9962A] flex items-center justify-center text-white font-bold shadow-md text-xs">
              {session.session_id}
            </div>

            {/* Title and Status */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#2E2815] mb-1">
                {session.title}
              </h3>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {isOpen ? "Open" : "Locked"}
              </span>
            </div>
          </div>

          {/* Date */}
          <p className="text-xs text-[#8B7E6A] mb-3 pl-15">
            <span className="font-semibold">Session Date:</span> {formattedDate}
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center justify-center p-2.5 rounded-lg text-sm font-semibold bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] transition-colors"
              title="Edit session"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {submitted > 0 && (
              <button
                onClick={() => setShowDocsModal(true)}
                className="flex items-center justify-center p-2.5 rounded-lg text-sm font-semibold bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] transition-colors"
                title="View all documents"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center p-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all shadow-sm hover:shadow-md"
              title="Delete session"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <button
              onClick={handleLock}
              disabled={isLocking}
              className={`flex items-center justify-center p-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isOpen
                  ? "bg-red-100 hover:bg-red-200 text-red-700"
                  : "bg-green-100 hover:bg-green-200 text-green-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isOpen ? "Lock session" : "Unlock session"}
            >
              {isLocking ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  )}
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#E3B23C] to-[#C9962A] flex items-center justify-center text-white font-bold shadow-md">
            {session.session_no}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-[#2E2815] truncate">
                {session.title}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {isOpen ? "Open" : "Locked"}
              </span>
            </div>
            <p className="text-xs text-[#8B7E6A] mt-0.5">
              <span className="font-semibold">Session Date:</span> {formattedDate}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Edit Button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] transition-colors"
              title="Edit session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="hidden sm:inline">Edit</span>
            </button>

            {/* View All Documents Button */}
            {submitted > 0 && (
              <button
                onClick={() => setShowDocsModal(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] transition-colors"
                title="View all documents"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="hidden md:inline">View Docs</span>
              </button>
            )}

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all shadow-sm hover:shadow-md"
              title="Delete session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="hidden lg:inline">Delete</span>
            </button>

            {/* Lock/Unlock Button */}
            <button
              onClick={handleLock}
              disabled={isLocking}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isOpen
                  ? "bg-red-100 hover:bg-red-200 text-red-700"
                  : "bg-green-100 hover:bg-green-200 text-green-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isOpen ? "Lock session" : "Unlock session"}
            >
              {isLocking ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : isOpen ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Lock</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Unlock</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#5C5037]">
              {submitted} / {assignedTeachersList.length} submitted
            </span>
            <span className="font-bold text-[#2E2815]">{pct}%</span>
          </div>
          <div className="h-2 bg-white/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              {submitted} Submitted
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              {notSubmittedTeachers.length} Not Submitted
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all ${
            isExpanded
              ? "bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815]"
              : "bg-white/80 hover:bg-white text-[#2E2815]"
          }`}
        >
          {isExpanded ? "Hide Details" : "View Details"}
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-[#E3B23C]/20 bg-white/50">
          <div className="p-4">
            <h4 className="font-semibold text-[#2E2815] mb-3">Teacher Submissions</h4>
            
            {/* Submitted Teachers */}
            {submittedTeachers.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h5 className="text-sm font-semibold text-green-700">
                    Submitted ({submittedTeachers.length})
                  </h5>
                </div>
                <div className="space-y-2">
                  {submittedTeachers.map((teacher) => {
                    const submission = submissionMap.get(teacher.id);
                    return (
                      <div
                        key={teacher.id}
                        className="flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-100"
                      >
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2E2815] truncate">
                            {teacher.full_name}
                          </p>
                          {teacher.school && (
                            <p className="text-xs text-[#8B7E6A] truncate">
                              {teacher.school}
                            </p>
                          )}
                        </div>
                        {submission && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* View Form */}
                            <Link
                              href={`/admin/view/${submission.id}`}
                              className="p-1.5 rounded-lg bg-white hover:bg-[#E3B23C] text-[#8B7E6A] hover:text-[#2E2815] transition-colors"
                              title="View Submission"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            {/* Download Word */}
                            <a
                              href={`/api/export/${submission.id}`}
                              download
                              className="p-1.5 rounded-lg bg-white hover:bg-[#E3B23C] text-[#8B7E6A] hover:text-[#2E2815] transition-colors"
                              title="Download Word"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Not Submitted Teachers */}
            {notSubmittedTeachers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <h5 className="text-sm font-semibold text-gray-700">
                    Not Submitted ({notSubmittedTeachers.length})
                  </h5>
                </div>
                <div className="space-y-2">
                  {notSubmittedTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2E2815] truncate">
                          {teacher.full_name}
                        </p>
                        {teacher.school && (
                          <p className="text-xs text-[#8B7E6A] truncate">
                            {teacher.school}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lock/Unlock Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            {/* Header */}
            <div
              className={`px-6 py-4 rounded-t-2xl ${
                isOpen
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-green-500 to-green-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {isOpen ? (
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  ) : (
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
                        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {isOpen ? "Lock This Session?" : "Unlock This Session?"}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Session Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#E3B23C] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    {session.session_id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#2E2815] truncate">
                      {session.title}
                    </h4>
                    <p className="text-xs text-[#8B7E6A]">
                      Session Date: {formattedDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning/Info Box */}
              {isOpen ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h5 className="font-semibold text-red-900 mb-2">
                        ⛔ Once locked:
                      </h5>
                      <ul className="space-y-1.5 text-sm text-red-800">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span>
                            Teachers will <strong>NOT</strong> be able to submit any forms for this session
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span>
                            Teachers will <strong>NOT</strong> be able to edit existing drafts
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span>This session will be marked as closed</span>
                        </li>
                      </ul>
                      <p className="text-xs text-red-700 mt-3 italic">
                        You can unlock it later if needed.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h5 className="font-semibold text-green-900 mb-2">
                        ✅ Once unlocked:
                      </h5>
                      <ul className="space-y-1.5 text-sm text-green-800">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>Teachers will be able to submit forms again</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>Teachers can edit their drafts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>This session will be marked as open</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#2E2815] font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLock}
                  disabled={isLocking}
                  className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isOpen
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isLocking ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Yes, ${isOpen ? "Lock" : "Unlock"} Session`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditModal && (
        <EditSessionModal
          session={session}
          teachers={teachers}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* View All Documents Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#2E2815]">
                  {session.title} - Submitted Documents
                </h3>
                <p className="text-sm text-[#2E2815]/70 mt-1">
                  Session {session.session_no} • {submitted} submitted
                </p>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {submittedTeachers.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No submitted documents yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submittedTeachers.map((teacher) => {
                    const submission = submissionMap.get(teacher.id);
                    return (
                      <div
                        key={teacher.id}
                        className="bg-gray-50 rounded-lg p-4 flex items-center gap-4"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-[#E3B23C] rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#2E2815]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#2E2815] mb-1">
                            {teacher.full_name}
                          </h4>
                          <p className="text-sm text-[#2E2815]/70">
                            {teacher.school || "No school info"}
                          </p>
                        </div>
                        {submission && (
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/view/${submission.id}`}
                              className="p-2 bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] rounded-lg transition-colors"
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
                              className="p-2 bg-[#E3B23C]/20 hover:bg-[#E3B23C]/30 text-[#2E2815] rounded-lg transition-colors"
                              title="Download"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {submittedTeachers.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleDownloadAll}
                  className="flex-1 bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                  </svg>
                  Download All ({submitted})
                </button>
                <button
                  onClick={() => setShowDocsModal(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-[#2E2815] font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2E2815]">Delete Session?</h3>
                  <p className="text-sm text-[#2E2815]/70 mt-1">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  You are about to delete:
                </p>
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#E3B23C] rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-[#2E2815]">
                        {session.session_no}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#2E2815] mb-1">
                        {session.title}
                      </h4>
                      <p className="text-sm text-[#2E2815]/70">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-[#2E2815]/80">
                <p className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>All <strong>{session.submissions?.filter(s => !s.deleted_at).length || 0} submissions</strong> for this session will be permanently deleted</span>
                </p>
                <p className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Teachers will no longer see this session in their dashboard</span>
                </p>
                <p className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>This action <strong>cannot be reversed</strong></span>
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-[#2E2815] font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSession}
                disabled={isDeleting}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
