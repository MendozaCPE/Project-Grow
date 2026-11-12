"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Submission = {
  id: string;
  session_id: string;
  status: "draft" | "submitted";
  updated_at: string;
  lac_sessions: {
    session_no: number;
    title: string;
    locked?: boolean;
  };
};

type DocumentsTabProps = {
  submissions: Submission[];
};

type StatusFilter = "all" | "draft" | "submitted";
type SortOrder = "newest" | "oldest" | "session";
type DisplayStatus = "Submitted" | "Pending" | "Failed to Submit";

const getDisplayStatus = (doc: Submission): DisplayStatus => {
  if (doc.lac_sessions?.locked && doc.status !== "submitted") return "Failed to Submit";
  if (doc.status === "draft") return "Pending";
  return "Submitted";
};

function StatusBadge({ doc, className = "" }: { doc: Submission; className?: string }) {
  const status = getDisplayStatus(doc);
  const isLocked = !!doc.lac_sessions?.locked;

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          status === "Submitted"
            ? "bg-green-100 text-green-700"
            : status === "Pending"
            ? "bg-blue-100 text-blue-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {status}
      </span>
      {isLocked && (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      )}
    </span>
  );
}

export default function DocumentsTab({ submissions }: DocumentsTabProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const all = submissions || [];
  const draftCount = all.filter((s) => s.status === "draft").length;
  const submittedCount = all.filter((s) => s.status === "submitted").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = all.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!q) return true;
      const title = s.lac_sessions?.title?.toLowerCase() || "";
      const no = String(s.lac_sessions?.session_no ?? "");
      return title.includes(q) || no.includes(q) || `session ${no}`.includes(q);
    });

    return list.sort((a, b) => {
      if (sortOrder === "session") {
        return (a.lac_sessions?.session_no ?? 0) - (b.lac_sessions?.session_no ?? 0);
      }
      const diff = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });
  }, [all, query, statusFilter, sortOrder]);

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: all.length },
    { key: "draft", label: "Pending", count: draftCount },
    { key: "submitted", label: "Submitted", count: submittedCount },
  ];

  const hasActiveFilters = query.trim() !== "" || statusFilter !== "all";

  const iconBtn =
    "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-[#8B6A14] bg-white border border-[#E3B23C]/40 hover:bg-[#E3B23C] hover:text-white hover:border-[#E3B23C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E3B23C]/60";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#E3B23C] to-[#C9962A] rounded-full" />
            <h2 className="text-2xl font-bold text-[#2E2815]">My Documents</h2>
          </div>
          <span className="px-3 py-1 bg-[#FBF6E4] text-[#8B7E6A] rounded-full text-sm font-semibold">
            {filtered.length} of {all.length}
          </span>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-[#8B7E6A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by session title or number"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#E3B23C]/30 bg-[#FBF6E4]/50 text-sm text-[#2E2815] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#E3B23C]/50 focus:border-[#E3B23C]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8B7E6A] hover:bg-[#E3B23C]/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            aria-label="Sort documents"
            className="py-2.5 px-3 rounded-xl border border-[#E3B23C]/30 bg-[#FBF6E4]/50 text-sm font-medium text-[#2E2815] focus:outline-none focus:ring-2 focus:ring-[#E3B23C]/50 focus:border-[#E3B23C]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="session">Session number</option>
          </select>
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

        {/* Single list */}
        <div className="space-y-3">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl border bg-gradient-to-r from-[#FBF6E4] to-white border-[#E3B23C]/20 hover:border-[#E3B23C]/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#E3B23C] to-[#C9962A] rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                  {doc.lac_sessions?.session_no}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-[#2E2815] truncate">
                    {doc.lac_sessions?.title}
                  </h4>
                  <p className="text-xs text-[#8B7E6A] mt-0.5">
                    {doc.status === "draft" ? "Updated" : "Submitted"}{" "}
                    {new Date(doc.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {/* Mobile badge */}
                  <StatusBadge doc={doc} className="sm:hidden mt-1.5" />
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Desktop badge */}
                  <StatusBadge doc={doc} className="hidden sm:flex" />

                  {/* Edit (always) */}
                  <Link
                    href={`/teacher/form/${doc.session_id}`}
                    aria-label={`Edit ${doc.lac_sessions?.title}`}
                    title="Edit"
                    className={iconBtn}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>

                  {/* Direct Word download (no modal) */}
                  <a
                    href={`/api/export/${doc.id}`}
                    download
                    aria-label={`Download ${doc.lac_sessions?.title} as Word document`}
                    title="Download Word document"
                    className={iconBtn}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-[#8B7E6A]">
                {all.length === 0
                  ? "No documents yet. Start filling out a form!"
                  : "No documents match your search."}
              </p>
              {hasActiveFilters && all.length > 0 && (
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
        </div>
      </div>
    </div>
  );
}