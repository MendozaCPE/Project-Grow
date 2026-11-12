import { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register - Project GROW",
  description: "Register as a teacher",
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-3 sm:p-4">
      <div className="max-w-md w-full bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2E2815] mb-2">
            Create Account
          </h1>
          <p className="text-sm text-[#2E2815]/70">
            Register as a teacher to access LAC Form 4
          </p>
        </div>

        <RegisterForm />

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm text-[#2E2815]/70">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#2E2815] font-semibold hover:text-[#C9962A] underline touch-manipulation inline-block min-h-[44px] leading-[44px]"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
