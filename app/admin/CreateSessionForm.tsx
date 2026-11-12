"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "./actions";

export default function CreateSessionForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      await createSession(formData);
      setIsOpen(false);
      router.refresh();
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px] flex items-center justify-center touch-manipulation"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Create New Session
      </button>
    );
  }

  return (
    <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-[#2E2815]">
          New LAC Session
        </h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setError("");
          }}
          className="text-[#2E2815]/50 hover:text-[#2E2815] p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#2E2815] mb-1">
            Session Number *
          </label>
          <input
            type="number"
            name="session_no"
            required
            min="1"
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none"
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2E2815] mb-1">
            Session Date *
          </label>
          <input
            type="date"
            name="session_date"
            required
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2E2815] mb-1">
            Session Title *
          </label>
          <input
            type="text"
            name="title"
            required
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none"
            placeholder="Introduction to Self-Learning Modules"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setError("");
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Session"}
          </button>
        </div>
      </form>
    </div>
  );
}
