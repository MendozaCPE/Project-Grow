import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register - Project GROW",
  description: "Register as a teacher",
};

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-white overflow-hidden">
      {/* Decorative yellow elements - Multiple circles/bubbles */}
      <div className="absolute top-10 right-20 w-32 h-32 bg-[#E3B23C]/20 rounded-full blur-2xl" />
      <div className="absolute top-40 right-40 w-24 h-24 bg-[#F3DC94]/30 rounded-full blur-xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#E3B23C]/15 rounded-full blur-2xl" />
      <div className="absolute bottom-40 left-32 w-28 h-28 bg-[#F3DC94]/25 rounded-full blur-xl" />
      <div className="absolute top-1/2 left-10 w-20 h-20 bg-[#E3B23C]/20 rounded-full blur-xl" />
      <div className="absolute top-1/3 right-10 w-36 h-36 bg-[#F3DC94]/20 rounded-full blur-2xl" />
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-[#E3B23C]/10 rounded-full blur-xl" />
      
      {/* Curved decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-[#E3B23C]/10 to-transparent rounded-full blur-3xl transform -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tr from-[#F3DC94]/15 to-transparent rounded-full blur-3xl transform translate-y-1/2" />
      
      {/* Main container with two columns */}
      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16 animate-scale-in">
        {/* Left side - Form */}
        <div className="flex-1 w-full max-w-md mx-auto">
          {/* Form section - No container */}
          <div className="p-4 sm:p-8 relative">
            <div className="text-center mb-4 sm:mb-8">
              <h1 className="text-3xl sm:text-5xl font-bold text-[#2E2815] mb-0 sm:mb-3">
                Project GROW
              </h1>
              <p className="text-[#E3B23C] text-sm sm:text-lg font-semibold -mt-1 mb-0 sm:mb-8">
                Learning Action Cell Form 4
              </p>
              
              {/* Logo on Mobile */}
              <div className="lg:hidden flex justify-center -mt-2 -mb-2 sm:mb-4">
                <div className="relative w-56 sm:w-48 h-56 sm:h-48">
                  <Image
                    src="/logo-1.png"
                    alt="Project GROW Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              
              <h2 className="text-lg sm:text-2xl font-semibold text-[#2E2815] mb-0 sm:mb-2">
                Register as a Teacher
              </h2>
            </div>

            <RegisterForm />

            {/* Links */}
            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-[#8B7E6A]">Already registered?</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[#8B7E6A] text-sm">
                  Already have an account?{" "}
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
