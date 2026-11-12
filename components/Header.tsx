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
    <header className="w-full bg-[#FFFDF5] border-b border-[#E3B23C]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Logo Container - Responsive */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
              <Image
                src="/logo-1.jpg"
                alt="School Logo 1"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 64px"
              />
            </div>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
              <Image
                src="/logo-2.jpg"
                alt="School Logo 2"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 64px"
              />
            </div>
          </div>

          {/* Project Title - Responsive */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#2E2815] truncate">
              Project GROW
            </h1>
            <p className="text-xs sm:text-sm text-[#2E2815]/70 truncate">
              LAC Form 4
            </p>
          </div>

          {/* User Info & Logout - Responsive */}
          {user && profile && (
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-[#2E2815] truncate max-w-[150px] lg:max-w-[200px]">
                  {profile.full_name}
                </p>
                <p className="text-xs text-[#2E2815]/60 capitalize">
                  {profile.role}
                </p>
              </div>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
