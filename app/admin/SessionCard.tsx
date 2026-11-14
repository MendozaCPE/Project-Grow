"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleSessionLock } from "./actions";

type SessionCardProps = {
  session: any;
  submitted: number;
  notStarted: number;
  teachers: number;
  formattedDate: string;
};

export default function SessionCard({
  session,
  submitted,
  notStarted,
  teachers,
  formattedDate,
}: SessionCardProps) {
  const [isLocking, setIsLocking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pct = teachers > 0 ? Math.round((submitted / teachers) * 100) : 0;
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

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isOpen
          ? "bg-gradient-to-r from-[#FFF3CD] via-[#FFE69C] to-[#FFF3CD] border-[#FFC107] shadow-lg"
          : "bg-gradient-to-r from-[#FBF6E4] to-white border-[#E3B23C]/20 hover:border-[#E3B23C]/40 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#E3B23C] to-[#C9962A] flex items-center justify-center text-white font-bold shadow-md text-xs">
          {session.session_id}
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

          {/* View Details Button */}
          <Link
            href={`/admin/sessions/${session.id}`}
            className="hidden sm:flex items-center gap-1 px-4 py-2 rounded-lg bg-white/80 hover:bg-white text-sm font-semibold text-[#2E2815] shadow-sm transition-colors"
          >
            View details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-[#5C5037]">
            {submitted} / {teachers} submitted
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
            {notStarted} Not started
          </span>
        </div>
      </div>

      {/* Mobile View Details Link */}
      <Link
        href={`/admin/sessions/${session.id}`}
        className="sm:hidden mt-3 flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg bg-white/80 text-sm font-semibold text-[#2E2815] shadow-sm"
      >
        View details
      </Link>

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
    </div>
  );
}
