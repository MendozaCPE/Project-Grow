"use client";

import { useState } from "react";

type DownloadModalProps = {
  submissionId: string;
  className?: string;
};

export default function DownloadModal({ submissionId, className = "" }: DownloadModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = (type: "word" | "pdf") => {
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
    
    setIsOpen(false);
  };

  return (
    <>
      {/* Download Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`bg-[#E3B23C] hover:bg-[#C9962A] text-white font-semibold py-2.5 px-6 rounded-lg transition-colors min-h-[48px] flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg ${className}`}
      >
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#2E2815]">Download Form</h3>
              <button
                onClick={() => setIsOpen(false)}
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
                onClick={() => handleDownload("word")}
                className="w-full bg-[#2B579A] hover:bg-[#1e3d6b] text-white font-semibold py-4 px-6 rounded-xl transition-all hover:shadow-lg flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                      <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 13h4m-4 3h4m-4 3h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
                onClick={() => handleDownload("pdf")}
                className="w-full bg-[#D32F2F] hover:bg-[#9a0007] text-white font-semibold py-4 px-6 rounded-xl transition-all hover:shadow-lg flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                      <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="8" y="17" fontSize="8" fontWeight="bold" fill="white">PDF</text>
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
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 py-2.5 px-4 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
