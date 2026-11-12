import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="w-full bg-[#FFFDF5] border-b-2 border-[#E3B23C]/20 sticky top-0 z-50 backdrop-blur-sm bg-[#FFFDF5]/95 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Logo Container - Responsive with animation */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 animate-fade-in">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg overflow-hidden shadow-md ring-2 ring-[#E3B23C]/20 transition-transform hover:scale-105">
              <Image
                src="/logo-1.png"
                alt="School Logo 1"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 64px"
              />
            </div>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg overflow-hidden shadow-md ring-2 ring-[#E3B23C]/20 transition-transform hover:scale-105">
              <Image
                src="/logo-2.png"
                alt="School Logo 2"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 64px"
              />
            </div>
          </div>

          {/* Project Title - Responsive with gradient */}
          <div className="flex-1 min-w-0 animate-fade-in">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#2E2815] truncate bg-gradient-to-r from-[#2E2815] to-[#5C5037] bg-clip-text">
              Project GROW
            </h1>
            <p className="text-xs sm:text-sm text-[#8B7E6A] truncate font-medium">
              LAC Form 4
            </p>
          </div>

          {/* User Info & Logout - Responsive */}
          {user && profile && (
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 animate-fade-in">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-[#2E2815] truncate max-w-[150px] lg:max-w-[200px]">
                  {profile.full_name}
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${profile.role === 'admin' ? 'bg-[#E3B23C]' : 'bg-green-500'}`} />
                  <p className="text-xs text-[#8B7E6A] capitalize font-medium">
                    {profile.role}
                  </p>
                </div>
              </div>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
