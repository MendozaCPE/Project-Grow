"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

type SidebarProps = {
  userRole: "teacher" | "admin";
  userName: string;
};

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const teacherLinks = [
    { href: "/teacher", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/teacher?tab=documents", label: "Documents", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: "/teacher?tab=sessions", label: "LAC Sessions", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { href: "/teacher?tab=settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/admin?tab=sessions", label: "LAC Sessions", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { href: "/admin/teachers", label: "Manage Teachers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { href: "/admin?tab=settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  const links = userRole === "admin" ? adminLinks : teacherLinks;

  return (
    <>
      {/* Mobile Arrow Toggle Button - Sticks to middle side */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-1/2 -translate-y-1/2 z-50 p-3 bg-gradient-to-r from-[#E3B23C] to-[#F3DC94] rounded-r-xl shadow-lg hover:shadow-xl transition-all ${
          isOpen ? "left-64" : "left-0"
        }`}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-[#2E2815]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 lg:w-72
          h-screen
          bg-gradient-to-b from-[#FBF6E4] to-[#F3DC94]/30
          border-r-2 border-[#E3B23C]/20
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
        `}
      >
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <Link href={`/${userRole}`} className="flex items-center gap-4 mb-8">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src="/logo-1.png"
                alt="Project GROW"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2E2815]">Project GROW</h2>
              <p className="text-xs text-[#E3B23C] font-semibold">LAC Form 4</p>
            </div>
          </Link>

          {/* Navigation - Sticky */}
          <nav className="space-y-2 flex-shrink-0">
            {links.map((link) => {
              // Check if the link matches current path and tab
              const linkHasTab = link.href.includes('?tab=');
              const linkTab = linkHasTab ? link.href.split('?tab=')[1] : null;
              const linkPath = link.href.split('?')[0];
              
              const isActive = 
                pathname === linkPath && 
                (linkHasTab ? currentTab === linkTab : !currentTab);
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#E3B23C] to-[#F3DC94] text-[#2E2815] shadow-md"
                        : "text-[#5C5037] hover:bg-white/60 hover:text-[#2E2815]"
                    }
                  `}
                >
                  <svg
                    className={`w-5 h-5 ${isActive ? "text-[#2E2815]" : "text-[#8B7E6A] group-hover:text-[#E3B23C]"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  <span className="font-semibold">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer to push user info to bottom */}
          <div className="flex-grow" />

          {/* User Info - At Bottom */}
          <div className="mt-8 p-4 bg-white/60 rounded-xl border border-[#E3B23C]/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#E3B23C] to-[#C9962A] rounded-full flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2E2815] truncate">{userName}</p>
                <p className="text-xs text-[#8B7E6A] capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
