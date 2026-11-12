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
import DownloadButton from "./DownloadButton";

type FormComponentProps = {
  sessionId: string;
  sessionNo: number;
  sessionTitle: string;
  sessionDate: string;
  sessionRegion?: string;
  sessionDivision?: string;
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
  sessionRegion = "Region IV - CALABARZON",
  sessionDivision = "Batangas",
  teacherName,
  isLocked,
  isViewMode,
  existingAnswers,
  submissionId,
  submissionStatus,
}: FormComponentProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<LACFormAnswers>(
    existingAnswers || { 
      name: teacherName,
      region: sessionRegion,
      division: sessionDivision,
      sessionNo: sessionNo
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [missingFields, setMissingFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnsubmitting, setIsUnsubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    // Clear the error for this field
    setMissingFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
  };

  const handleCommentChange = (commentId: string, value: string) => {
    if (!isEditable) return;
    setAnswers((prev) => ({ ...prev, [commentId]: value }));
  };

  const handleReflectionChange = (questionId: string, value: string) => {
    if (!isEditable) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear the error for this field
    setMissingFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
  };

  const handleNameChange = (value: string) => {
    if (!isEditable) return;
    setAnswers((prev) => ({ ...prev, name: value }));
    // Clear the error for this field
    setMissingFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete('name');
      return newSet;
    });
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
      
      // Extract field IDs from error messages and mark them as missing
      const missing = new Set<string>();
      validation.errors.forEach(error => {
        // Extract question IDs from error messages
        if (error.includes('Name') && error.includes('required')) {
          missing.add('name');
        }
        if (error.includes('statement')) {
          const match = error.match(/statement (\d+)/);
          if (match) {
            const num = match[1];
            missing.add(`q${num}`);
          }
        }
        // Handle Part B reflection questions
        if (error.includes('Part B')) {
          const match = error.match(/Question (\d+)/);
          if (match) {
            const num = match[1];
            missing.add(`b${num}`);
          }
        }
      });
      
      setMissingFields(missing);
      
      // Scroll to first error
      const firstMissingElement = document.querySelector('[data-has-error="true"]');
      if (firstMissingElement) {
        firstMissingElement.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    setIsSubmitting(true);
    setErrors([]);
    setMissingFields(new Set());

    try {
      await submitForm(sessionId, answers, submissionId);
      // Show success modal instead of immediately redirecting
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Submit failed:", error);
      setErrors(["Failed to submit. Please try again."]);
      setIsSubmitting(false);
    }
  };

  const handleUnsubmit = async () => {
    if (!submissionId) return;

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
      className={`flex-1 min-w-[40px] sm:min-w-[60px] max-w-[55px] sm:max-w-none min-h-[40px] sm:min-h-[48px] px-1 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-semibold text-xs sm:text-base transition-all touch-manipulation ${
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
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-[#2E2815] text-center mb-3">
              Form Submitted Successfully!
            </h2>

            {/* Message */}
            <div className="space-y-3 mb-6">
              <p className="text-[#2E2815] text-center">
                Your LAC Form 4 has been submitted to the admin.
              </p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> You can continue to edit this form anytime. The admin will always receive your most recent version.
                </p>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={() => router.push("/teacher")}
              className="w-full bg-[#E3B23C] hover:bg-[#D4A02C] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Got it, Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Error Messages - Only show generic errors, not field-specific */}
      {errors.length > 0 && errors.some(e => e.includes('Failed')) && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">
            Error
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {errors.filter(e => e.includes('Failed')).map((error, index) => (
              <li key={index} className="text-red-700 text-sm">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation reminder when there are missing fields */}
      {missingFields.size > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
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
            <div>
              <h3 className="text-red-800 font-semibold mb-1">
                Please complete all required fields
              </h3>
              <p className="text-red-700 text-sm">
                Missing fields are highlighted below. Please scroll down and fill them in.
              </p>
            </div>
          </div>
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
              data-has-error={missingFields.has('name')}
              className={`w-full px-3 py-2 border-2 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 ${
                missingFields.has('name')
                  ? 'border-red-500 bg-red-50 animate-pulse'
                  : 'border-gray-300'
              }`}
              placeholder="Your full name"
            />
            {missingFields.has('name') && (
              <p className="text-red-600 text-xs mt-1 font-semibold">This field is required</p>
            )}
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
              Number of LAC Sessions *
            </label>
            <input
              type="number"
              value={answers.sessionNo !== undefined ? answers.sessionNo : sessionNo}
              onChange={(e) => {
                if (!isEditable) return;
                setAnswers((prev) => ({ ...prev, sessionNo: parseInt(e.target.value) || sessionNo }));
              }}
              disabled={!isEditable}
              min="1"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none disabled:bg-gray-100 disabled:text-gray-600"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-1">
              Region *
            </label>
            <input
              type="text"
              value={answers.region || sessionRegion}
              onChange={(e) => {
                if (!isEditable) return;
                setAnswers((prev) => ({ ...prev, region: e.target.value }));
              }}
              disabled={!isEditable}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none disabled:bg-gray-100 disabled:text-gray-600"
              placeholder="Region IV - CALABARZON"
            />
          </div>

          {/* Division */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[#2E2815] mb-1">
              Division *
            </label>
            <input
              type="text"
              value={answers.division || sessionDivision}
              onChange={(e) => {
                if (!isEditable) return;
                setAnswers((prev) => ({ ...prev, division: e.target.value }));
              }}
              disabled={!isEditable}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none disabled:bg-gray-100 disabled:text-gray-600"
              placeholder="Batangas"
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
            data-has-error={missingFields.has(statement.id)}
            className={`rounded-lg p-4 mb-4 border-2 ${
              missingFields.has(statement.id)
                ? 'bg-red-50 border-red-500 animate-pulse'
                : 'bg-white border-gray-200'
            }`}
          >
            <p className="text-sm sm:text-base text-[#2E2815] mb-3 font-medium">
              {statement.number}. {statement.text}
            </p>

            {/* Rating Buttons */}
            <div className="flex gap-1 sm:gap-2 mb-3 w-full overflow-x-auto">
              {ratingOptions.map((option) => (
                <RatingButton
                  key={option.value}
                  option={option}
                  selected={answers[statement.id as keyof LACFormAnswers] === option.value}
                  onClick={() => handleRatingChange(statement.id, option.value)}
                />
              ))}
            </div>

            {/* Error indicator */}
            {missingFields.has(statement.id) && (
              <p className="text-red-600 text-xs mb-3 font-semibold">⚠️ Please select a rating</p>
            )}

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
            data-has-error={missingFields.has(statement.id)}
            className={`rounded-lg p-4 mb-4 border-2 ${
              missingFields.has(statement.id)
                ? 'bg-red-50 border-red-500 animate-pulse'
                : 'bg-white border-gray-200'
            }`}
          >
            <p className="text-sm sm:text-base text-[#2E2815] mb-3 font-medium">
              {statement.number}. {statement.text}
            </p>

            {/* Rating Buttons */}
            <div className="flex gap-1 sm:gap-2 mb-3 w-full overflow-x-auto">
              {ratingOptions.map((option) => (
                <RatingButton
                  key={option.value}
                  option={option}
                  selected={answers[statement.id as keyof LACFormAnswers] === option.value}
                  onClick={() => handleRatingChange(statement.id, option.value)}
                />
              ))}
            </div>

            {/* Error indicator */}
            {missingFields.has(statement.id) && (
              <p className="text-red-600 text-xs mb-3 font-semibold">⚠️ Please select a rating</p>
            )}

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
          <div 
            key={question.id} 
            className="mb-4 last:mb-0"
            data-has-error={missingFields.has(question.id)}
          >
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
              className={`w-full px-3 py-2 border-2 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none disabled:bg-gray-100 disabled:text-gray-600 resize-y ${
                missingFields.has(question.id)
                  ? 'border-red-500 bg-red-50 animate-pulse'
                  : 'border-gray-300'
              }`}
              placeholder={
                question.required
                  ? "This field is required"
                  : "Optional - leave blank if not applicable"
              }
            />
            {missingFields.has(question.id) && (
              <p className="text-red-600 text-xs mt-1 font-semibold">⚠️ This field is required</p>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6">
        {/* Locked Session Warning */}
        {isLocked && !isViewMode && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <div>
                <h3 className="text-red-800 font-semibold mb-1">
                  Session Locked
                </h3>
                <p className="text-red-700 text-sm mb-1">
                  The admin is no longer receiving forms for this session. You cannot submit new forms at this time.
                </p>
                <p className="text-red-600 text-xs">
                  You can still edit and download your form for your records.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Admin View - Session Locked Warning */}
        {isLocked && isViewMode && (
          <div className="bg-gray-100 border-2 border-gray-400 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5"
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
              <div>
                <h3 className="text-gray-800 font-semibold">
                  Session Locked
                </h3>
              </div>
            </div>
          </div>
        )}

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

          {isEditable && !isLocked && (
            <>
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

          {/* Unsubmit Button for Submitted (View Mode) */}
          {isSubmitted && isViewMode && !isLocked && (
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

          {/* Download Button */}
          {submissionId && <DownloadButton submissionId={submissionId} className="flex-1" />}
        </div>

        {/* Status Info */}
        {submissionStatus && !isLocked && (
          <div className="mt-4 text-center">
            {submissionStatus === "draft" ? (
              <div className="space-y-2">
                <p className="text-sm text-[#2E2815]/70">
                  This form is saved as a draft. Click Submit when ready.
                </p>
                {/* Auto-save indicator */}
                {isEditable && (
                  <div className="flex items-center justify-center gap-2 text-xs">
                    {saveStatus === "saving" && (
                      <span className="text-blue-600 flex items-center gap-1">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    )}
                    {saveStatus === "saved" && (
                      <span className="text-green-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        All changes saved
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#2E2815]/70">
                This form has been submitted. You can continue editing anytime.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
