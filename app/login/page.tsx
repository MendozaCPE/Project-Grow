import { Metadata } from "next";
import { connection } from "next/server";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In - Project GROW",
  description: "Sign in to access LAC Form 4",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; deactivated?: string; reset?: string }>;
}) {
  await connection();
  const params = await searchParams;
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
      <div className="max-w-md w-full bg-[#FFFDF5] rounded-lg shadow-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2815] mb-2">
            Sign In
          </h1>
          <p className="text-sm text-[#2E2815]/70">
            Welcome back to Project GROW
          </p>
        </div>

        {params.registered && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-800">
              Account created successfully! Please sign in.
            </p>
          </div>
        )}

        {params.reset && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-800">
              Password reset successfully! Please sign in with your new password.
            </p>
          </div>
        )}

        {params.deactivated && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">
              Your account is deactivated. Please contact the administrator.
            </p>
          </div>
        )}

        <LoginForm />

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-[#2E2815]/70">
            <a
              href="/forgot-password"
              className="text-[#2E2815] font-semibold hover:text-[#C9962A] underline"
            >
              Forgot password?
            </a>
          </p>
          <p className="text-sm text-[#2E2815]/70">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-[#2E2815] font-semibold hover:text-[#C9962A] underline"
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
