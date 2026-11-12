"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  type LACFormAnswers,
  type RatingValue,
  ratingOptions,
  partASections,
  partBQuestions,
  validateFormAnswers,
} from "@/lib/lacForm4";
import { saveFormDraft, submitForm, unsubmitForm } from "./actions";

type FormComponentProps = {
  sessionId: string;
  sessionNo: number;
  sessionTitle: string;
  sessionDate: string;
  teacherName: string;
  isLocked: boolean;
  isViewMode: boolean;
  existingAnswers?: LACFormAnswers;
  submissionId?: string;
  submissionStatus?: "draft" | "submitted";
};

export default function FormComponent({
  sessionId,
  sessionNo,
  sessionTitle,
  sessionDate,
  teacherName,
  isLocked,
  isViewMode,
  existingAnswers,
  submissionId,
  submissionStatus,
}: FormComponentProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<LACFormAnswers>(
    existingAnswers || { name: teacherName }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnsubmitting, setIsUnsubmitting] = useState(false);

  const isEditable = !isLocked && !isViewMode;
  const isSubmitted = submissionStatus === "submitted";

  // Auto-save effect
  useEffect(() => {
    if (!isEditable) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timer);
  }, [answers, isEditable]);

  const handleAutoSave = useCallback(async () => {
    if (!isEditable || isSaving) return;

    setSaveStatus("saving");
    setIsSaving(true);

    try {
      await saveFormDraft(sessionId, answers, submissionId);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setSaveStatus("idle");
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, answers, submissionId, isEditable, isSaving]);

  const handleRatingChange = (questionId: string, value: RatingValue) => {
    if (!isEditable) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCommentChange = (commentId: string, value: string) => {
    if (!isEditable) return;
    setAnswers((prev) => ({ ...prev, [commentId]: value }));
  };

  const handleReflectionChange = (questionId: string, value: string) => {
    if (!isEditable) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNameChange = (value: string) => {
    if (!isEditable) return;
    setAnswers((prev) => ({ ...prev, name: value }));
  };

  const handleSave = async () => {
    if (!isEditable) return;

    setSaveStatus("saving");
    setIsSaving(true);
    setErrors([]);

    try {
      await saveFormDraft(sessionId, answers, submissionId);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Save failed:", error);
      setErrors(["Failed to save. Please try again."]);
      setSaveStatus("idle");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!isEditable) return;

    // Validate
    const validation = validateFormAnswers(answers);
    if (!validation.isValid) {
      setErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      await submitForm(sessionId, answers, submissionId);
      router.push("/teacher");
    } catch (error) {
      console.error("Submit failed:", error);
      setErrors(["Failed to submit. Please try again."]);
      setIsSubmitting(false);
    }
  };

  const handleUnsubmit = async () => {
    if (!submissionId || isLocked) return;

    const confirmed = window.confirm(
      "Are you sure you want to unsubmit this form? You can edit and resubmit it later."
    );

    if (!confirmed) return;

    setIsUnsubmitting(true);
    setErrors([]);

    try {
      await unsubmitForm(submissionId, sessionId);
      router.refresh();
    } catch (error) {
      console.error("Unsubmit failed:", error);
      setErrors(["Failed to unsubmit. Please try again."]);
      setIsUnsubmitting(false);
    }
  };

  const RatingButton = ({
    option,
    selected,
    onClick,
  }: {
    option: typeof ratingOptions[0];
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!isEditable}
      className={`flex-1 min-w-[60px] min-h-[48px] px-3 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all touch-manipulation ${
        selected
          ? "bg-[#F3DC94] border-2 border-[#E3B23C] text-[#2E2815] shadow-md"
          : isEditable
          ? "bg-white border-2 border-gray-300 text-[#2E2815] hover:border-[#E3B23C]"
          : "bg-gray-100 border-2 border-gray-200 text-gray-500"
      }`}
      title={option.full}
    >
      {option.label}
    </button>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-red-700 text-sm">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Save Status */}
      {saveStatus !== "idle" && (
        <div className="fixed top-20 right-4 z-50 bg-[#FFFDF5] shadow-lg rounded-lg px-4 py-2 border-2 border-[#E3B23C]">
          <span className="text-sm font-semibold text-[#2E2815]">
            {saveStatus === "saving" ? "Saving..." : "✓ Saved"}
          </span>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] mb-4">
          LAC Form 4: Learning Action Cell Members' Post-LAC Session Report
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[#2E2815] mb-1">
              Name of Member *
            </label>
            <input
              type="text"
              value={answers.name || ""}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={!isEditable}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none disabled:bg-gray-100 disabled:text-gray-600"
              placeholder="Your full name"
            />
          </div>

          {/* LAC Session ID */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-1">
              LAC Session ID
            </label>
            <input
              type="text"
              value={`LAC-${sessionNo}`}
              disabled
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base bg-gray-100 text-gray-600"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-1">
              Date
            </label>
            <input
              type="text"
              value={new Date(sessionDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              disabled
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base bg-gray-100 text-gray-600"
            />
          </div>

          {/* Number */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-1">
              Number
            </label>
            <input
              type="text"
              value={sessionNo.toString()}
              disabled
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base bg-gray-100 text-gray-600"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-1">
              Region
            </label>
            <input
              type="text"
              value="IV-A CALABARZON"
              disabled
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base bg-gray-100 text-gray-600"
            />
          </div>

          {/* Division */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[#2E2815] mb-1">
              Division
            </label>
            <input
              type="text"
              value="Batangas"
              disabled
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base bg-gray-100 text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* PART A */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] mb-2">
          PART A
        </h2>
        <p className="text-sm text-[#2E2815]/70 mb-4">
          Please indicate the extent to which you agree with each of the following
          statements by selecting the appropriate option.
        </p>

        {/* Rating Legend */}
        <div className="bg-[#E3B23C]/10 rounded-lg p-3 mb-4 flex flex-wrap gap-2 text-xs sm:text-sm">
          {ratingOptions.map((option) => (
            <span key={option.value} className="text-[#2E2815]">
              <strong>{option.label}</strong> = {option.full}
            </span>
          ))}
        </div>

        {/* THE LAC SESSION Section */}
        <h3 className="text-base sm:text-lg font-bold text-[#2E2815] mb-3 mt-6">
          {partASections.lacSession.title}
        </h3>

        {partASections.lacSession.statements.map((statement) => (
          <div
            key={statement.id}
            className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200"
          >
            <p className="text-sm sm:text-base text-[#2E2815] mb-3 font-medium">
              {statement.number}. {statement.text}
            </p>

            {/* Rating Buttons */}
            <div className="flex gap-2 mb-3">
              {ratingOptions.map((option) => (
                <RatingButton
                  key={option.value}
                  option={option}
                  selected={answers[statement.id as keyof LACFormAnswers] === option.value}
                  onClick={() => handleRatingChange(statement.id, option.value)}
                />
              ))}
            </div>

            {/* Comments */}
            <label className="block text-sm font-semibold text-[#2E2815] mb-1">
              Comments/Remarks
            </label>
            <textarea
              value={answers[`c${statement.number}` as keyof LACFormAnswers] as string || ""}
              onChange={(e) =>
                handleCommentChange(`c${statement.number}`, e.target.value)
              }
              onBlur={handleAutoSave}
              disabled={!isEditable}
              placeholder=""
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 resize-y"
            />
          </div>
        ))}

        {/* ACTION PLAN Section */}
        <h3 className="text-base sm:text-lg font-bold text-[#2E2815] mb-3 mt-6">
          {partASections.actionPlan.title}
        </h3>

        {partASections.actionPlan.statements.map((statement) => (
          <div
            key={statement.id}
            className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200"
          >
            <p className="text-sm sm:text-base text-[#2E2815] mb-3 font-medium">
              {statement.number}. {statement.text}
            </p>

            {/* Rating Buttons */}
            <div className="flex gap-2 mb-3">
              {ratingOptions.map((option) => (
                <RatingButton
                  key={option.value}
                  option={option}
                  selected={answers[statement.id as keyof LACFormAnswers] === option.value}
                  onClick={() => handleRatingChange(statement.id, option.value)}
                />
              ))}
            </div>

            {/* Comments */}
            <label className="block text-sm font-semibold text-[#2E2815] mb-1">
              Comments/Remarks
            </label>
            <textarea
              value={answers[`c${statement.number}` as keyof LACFormAnswers] as string || ""}
              onChange={(e) =>
                handleCommentChange(`c${statement.number}`, e.target.value)
              }
              onBlur={handleAutoSave}
              disabled={!isEditable}
              placeholder=""
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 resize-y"
            />
          </div>
        ))}
      </div>

      {/* PART B: REFLECTION */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#2E2815] mb-2">
          PART B: Reflection
        </h2>
        <p className="text-sm text-[#2E2815]/70 mb-4">
          Please provide the information requested.
        </p>

        {partBQuestions.map((question) => (
          <div key={question.id} className="mb-4 last:mb-0">
            <label className="block text-sm sm:text-base font-semibold text-[#2E2815] mb-2">
              {question.number}. {question.text}
              {question.required && <span className="text-red-600"> *</span>}
            </label>
            <textarea
              value={answers[question.id as keyof LACFormAnswers] as string || ""}
              onChange={(e) =>
                handleReflectionChange(question.id, e.target.value)
              }
              onBlur={handleAutoSave}
              disabled={!isEditable}
              rows={4}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 resize-y"
              placeholder={
                question.required
                  ? "This field is required"
                  : "Optional - leave blank if not applicable"
              }
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push("/teacher")}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px] flex items-center justify-center touch-manipulation"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>

          {isEditable && (
            <>
              {/* Save Draft Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px] flex items-center justify-center touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
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
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                {isSaving ? "Saving..." : "Save Draft"}
              </button>

              {/* Submit/Unsubmit Button - Dynamic */}
              <button
                type="button"
                onClick={isSubmitted ? handleUnsubmit : handleSubmit}
                disabled={isSubmitted ? isUnsubmitting : isSubmitting}
                className={`flex-1 ${
                  isSubmitted
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-green-600 hover:bg-green-700"
                } text-white font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px] flex items-center justify-center touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isSubmitted ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
                {isSubmitted
                  ? isUnsubmitting
                    ? "Unsubmitting..."
                    : "Unsubmit"
                  : isSubmitting
                  ? "Submitting..."
                  : "Submit"}
              </button>
            </>
          )}

          {/* Unsubmit Button for Submitted + Unlocked (View Mode) */}
          {isSubmitted && !isLocked && isViewMode && (
            <button
              type="button"
              onClick={handleUnsubmit}
              disabled={isUnsubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px] flex items-center justify-center touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              {isUnsubmitting ? "Unsubmitting..." : "Unsubmit"}
            </button>
          )}

          {/* Download Word Button */}
          {submissionId && (
            <a
              href={`/api/export/${submissionId}`}
              className="flex-1 bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px] flex items-center justify-center touch-manipulation"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Word
            </a>
          )}
        </div>

        {/* Status Info */}
        {submissionStatus && (
          <div className="mt-4 text-center text-sm text-[#2E2815]/70">
            {submissionStatus === "draft" ? (
              <p>This form is saved as a draft. Click Submit when ready.</p>
            ) : (
              <p>
                This form has been submitted. You can continue editing until the
                session is locked.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
