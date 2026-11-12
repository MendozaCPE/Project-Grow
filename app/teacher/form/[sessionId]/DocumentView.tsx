"use client";

import Image from "next/image";
import type { LACFormAnswers } from "@/lib/lacForm4";
import { partASections, partBQuestions } from "@/lib/lacForm4";

type DocumentViewProps = {
  answers: LACFormAnswers;
  sessionNo: number;
  sessionTitle: string;
  sessionDate: string;
  teacherName: string;
};

export default function DocumentView({
  answers,
  sessionNo,
  sessionTitle,
  sessionDate,
  teacherName,
}: DocumentViewProps) {
  const formattedDate = new Date(sessionDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getCheckmark = (questionId: string, rating: string) => {
    const answer = answers[questionId as keyof LACFormAnswers];
    return answer === rating ? "✓" : "";
  };

  return (
    <div className="bg-white shadow-2xl max-w-[8.5in] mx-auto min-h-[11in] print:shadow-none">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .document-view {
            box-shadow: none !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Document Header with Logos */}
      <div className="p-8 pb-4 border-b-4 border-[#2E2815]">
        <div className="flex items-start justify-between mb-4">
          {/* Left Logo */}
          <div className="w-20 h-20 relative flex-shrink-0">
            <Image
              src="/logo-1.jpg"
              alt="DepEd Logo"
              width={80}
              height={80}
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Center Header */}
          <div className="flex-1 text-center px-4">
            <p className="text-sm font-semibold">Republic of the Philippines</p>
            <p className="text-sm font-semibold">Department of Education</p>
            <p className="text-lg font-bold mt-1">MALARUHATAN ELEMENTARY</p>
            <p className="text-xs mt-1">Malaruhatan, Lian, Batangas</p>
          </div>

          {/* Right Logo */}
          <div className="w-20 h-20 relative flex-shrink-0">
            <Image
              src="/logo-2.jpg"
              alt="School Logo"
              width={80}
              height={80}
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Document Body */}
      <div className="p-8">
        {/* Form Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">LAC FORM 4</h1>
        </div>

        {/* Header Table */}
        <table className="w-full border-2 border-black mb-6" cellSpacing="0" cellPadding="0">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-semibold w-1/2">
                NAME OF MEMBER: {answers.name || teacherName}
              </td>
              <td className="border border-black p-2 font-semibold">
                LAC SESSION ID: LAC-{sessionNo}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">
                REGION: IV-A CALABARZON
              </td>
              <td className="border border-black p-2 font-semibold">
                DATE OF LAC SESSION: {formattedDate}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">
                DIVISION: BATANGAS
              </td>
              <td className="border border-black p-2 font-semibold">
                NUMBER OF LAC SESSION: {sessionNo}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Part A */}
        <div className="mb-6">
          <h2 className="font-bold mb-2">Part A</h2>
          <p className="text-sm mb-3">
            Please indicate the extent to which you agree with each of the following
            statements by ticking the appropriate box.
          </p>
          <p className="text-xs mb-4 italic">
            (SD = Strongly Disagree; D = Disagree; N = Neutral; A = Agree; SA =
            Strongly agree)
          </p>

          {/* Ratings Table */}
          <table className="w-full border-2 border-black text-sm" cellSpacing="0" cellPadding="0">
            <thead>
              <tr>
                <th className="border border-black p-2 text-left" rowSpan={2}>
                  THE LAC SESSION
                </th>
                <th className="border border-black p-1 text-center w-10">SD</th>
                <th className="border border-black p-1 text-center w-10">D</th>
                <th className="border border-black p-1 text-center w-10">N</th>
                <th className="border border-black p-1 text-center w-10">A</th>
                <th className="border border-black p-1 text-center w-10">SA</th>
                <th className="border border-black p-2 text-left" rowSpan={2}>
                  Comments/Remarks (For example, if you disagree or strongly disagree, please indicate why)
                </th>
              </tr>
            </thead>
            <tbody>
              {partASections.lacSession.statements.map((statement) => (
                <tr key={statement.id}>
                  <td className="border border-black p-2">
                    {statement.number}. {statement.text}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getCheckmark(statement.id, "SD")}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getCheckmark(statement.id, "D")}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getCheckmark(statement.id, "N")}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getCheckmark(statement.id, "A")}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getCheckmark(statement.id, "SA")}
                  </td>
                  <td className="border border-black p-2 text-xs">
                    {(answers[`c${statement.number}` as keyof LACFormAnswers] as string) || ""}
                  </td>
                </tr>
              ))}

              {/* ACTION PLAN Section */}
              <tr>
                <td className="border border-black p-2 font-semibold" colSpan={7}>
                  ACTION PLAN
                </td>
              </tr>
              {partASections.actionPlan.statements.map((statement) => (
                <tr key={statement.id}>
                  <td className="border border-black p-2">
                    {statement.number}. {statement.text}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getCheckmark(statement.id, "SD")}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getCheckmark(statement.id, "D")}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getCheckmark(statement.id, "N")}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getCheckmark(statement.id, "A")}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getCheckmark(statement.id, "SA")}
                  </td>
                  <td className="border border-black p-2 text-xs">
                    {(answers[`c${statement.number}` as keyof LACFormAnswers] as string) || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Part B - Reflection */}
        <div className="mb-6">
          <h2 className="font-bold mb-2">Part B: Reflection</h2>
          <p className="text-sm mb-4">Please provide the information requested.</p>

          {partBQuestions.map((question) => {
            const answer = answers[question.id as keyof LACFormAnswers] as string;

            return (
              <div key={question.id} className="mb-4">
                <p className="font-semibold text-sm mb-2">
                  {question.number}. {question.text}
                </p>
                <div className="border border-black p-3 min-h-[80px] text-sm whitespace-pre-wrap">
                  {answer || ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-gray-50 border-t-2 border-gray-200 flex gap-3 justify-center print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold py-3 px-8 rounded-lg transition-colors min-h-[48px] inline-flex items-center"
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
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Document
        </button>

        <button
          onClick={() => window.history.back()}
          className="bg-gray-300 hover:bg-gray-400 text-[#2E2815] font-semibold py-3 px-8 rounded-lg transition-colors min-h-[48px] inline-flex items-center"
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
      </div>
    </div>
  );
}
