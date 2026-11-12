import { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password - Project GROW",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
      <div className="max-w-md w-full bg-[#FFFDF5] rounded-lg shadow-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2815] mb-2">
            Reset Password
          </h1>
          <p className="text-sm text-[#2E2815]/70">
            Enter your new password below
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
