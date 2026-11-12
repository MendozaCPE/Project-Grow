import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password - Project GROW",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-white">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#E3B23C]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#F3DC94]/10 rounded-full blur-3xl" />
      
      {/* Main container with two columns */}
      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16 animate-scale-in">
        {/* Left side - Form */}
        <div className="flex-1 w-full max-w-md mx-auto">
          {/* Form section - No container */}
          <div className="p-8 relative">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-gradient-to-br from-[#E3B23C] to-[#C9962A] rounded-full mb-4 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#2E2815] mb-2">
                Reset Password
              </h2>
              <p className="text-[#8B7E6A] text-sm leading-relaxed mb-4">
                Enter your email and we'll send you a link to reset your password
              </p>
              
              {/* Logo on Mobile - Just logo, no circle */}
              <div className="lg:hidden flex justify-center mb-4">
                <div className="relative w-48 h-48">
                  <Image
                    src="/logo-1.png"
                    alt="Project GROW Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <ForgotPasswordForm />

            {/* Links */}
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-[#8B7E6A]">Remember it now?</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[#8B7E6A] text-sm">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-[#E3B23C] hover:text-[#C9962A] font-bold transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Logo Image - Bigger on Desktop */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="relative w-[500px] h-[500px]">
            <div className="absolute inset-0 bg-[#E3B23C]/10 rounded-full blur-3xl"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#E3B23C]/20 to-[#F3DC94]/20 backdrop-blur-sm p-16 shadow-2xl">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo-1.png"
                    alt="Project GROW Logo"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
