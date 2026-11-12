"use client";

import { useState } from "react";
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
  const [downloadModalOpen, setDownloadModalOpen] = useState<string | null>(null);

  const handleDownload = (submissionId: string, type: "word" | "pdf") => {
    const url = type === "word" 
      ? `/api/export/${submissionId}` 
      : `/api/export-pdf/${submissionId}`;
    
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setDownloadModalOpen(null);
  };

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
    <div className="space-y-3">
      {sessions.map((session) => {
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
                    className="flex-1 min-w-[100px] bg-[#E3B23C] hover:bg-[#C9962A] text-white text-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
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
                        className="flex-1 min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
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

            {/* Download Modal */}
            {submission && downloadModalOpen === submission.id && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
                onClick={(e) => {
                  e.stopPropagation();
                  setDownloadModalOpen(null);
                }}
              >
                <div 
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#2E2815]">Download Form</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDownloadModalOpen(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-6">
                    Choose your preferred format to download this LAC Form 4 submission.
                  </p>

                  {/* Download Options */}
                  <div className="space-y-3">
                    {/* Word Option */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(submission.id, "word");
                      }}
                      className="w-full bg-[#2B579A] hover:bg-[#1e3d6b] text-white font-semibold py-4 px-6 rounded-xl transition-all hover:shadow-lg flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                            <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-bold">Microsoft Word</p>
                          <p className="text-xs text-white/80">Editable .docx format</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* PDF Option */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(submission.id, "pdf");
                      }}
                      className="w-full bg-[#D32F2F] hover:bg-[#9a0007] text-white font-semibold py-4 px-6 rounded-xl transition-all hover:shadow-lg flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                            <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-bold">PDF Document</p>
                          <p className="text-xs text-white/80">Read-only .pdf format</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Cancel Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDownloadModalOpen(null);
                    }}
                    className="w-full mt-4 py-2.5 px-4 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
