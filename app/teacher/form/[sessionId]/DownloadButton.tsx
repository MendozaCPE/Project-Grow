"use client";

type DownloadButtonProps = {
  submissionId: string;
  className?: string;
};

export default function DownloadButton({ submissionId, className = "" }: DownloadButtonProps) {
  const handleDownload = () => {
    const url = `/api/export/${submissionId}`;
    
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
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
  );
}
