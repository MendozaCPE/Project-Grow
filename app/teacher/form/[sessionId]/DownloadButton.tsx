"use client";

import { useState } from "react";

type DownloadButtonProps = {
  submissionId: string;
  className?: string;
};

export default function DownloadButton({ submissionId, className = "" }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const url = `/api/export/${submissionId}`;
      
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Keep loading state for a moment to provide feedback
      setTimeout(() => setIsDownloading(false), 1500);
    } catch (error) {
      console.error("Download failed:", error);
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`bg-[#E3B23C] hover:bg-[#C9962A] text-white font-semibold py-2.5 px-6 rounded-lg transition-colors min-h-[48px] flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isDownloading ? (
        <>
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Downloading...
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download
        </>
      )}
    </button>
  );
}
