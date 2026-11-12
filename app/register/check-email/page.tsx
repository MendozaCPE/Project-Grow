import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Email - Project GROW",
};

export default function CheckEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
      <div className="max-w-md w-full bg-[#FFFDF5] rounded-lg shadow-md p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-[#E3B23C]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[#E3B23C]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#2E2815] mb-2">
          Check Your Email
        </h1>
        <p className="text-[#2E2815]/70 mb-6">
          We've sent you a confirmation email. Please click the link in the
          email to verify your account.
        </p>

        <div className="bg-[#F3DC94]/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-[#2E2815]">
            <strong>Didn't receive the email?</strong>
            <br />
            Check your spam folder or contact your administrator.
          </p>
        </div>

        <a
          href="/login"
          className="inline-block min-h-[48px] px-6 py-3 bg-[#E3B23C] hover:bg-[#C9962A] 
                   text-[#2E2815] font-semibold rounded-lg transition-colors"
        >
          Go to Sign In
        </a>
      </div>
    </div>
  );
}
