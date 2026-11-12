import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TeachersList from "./TeachersList";

type PageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function TeachersPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { search } = await searchParams;

  // Check if user is authenticated and admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/teacher");
  }

  // Fetch all teachers
  const { data: teachers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "teacher")
    .order("full_name");

  // Filter by search if provided
  const filteredTeachers = search
    ? teachers?.filter(
        (teacher) =>
          teacher.full_name.toLowerCase().includes(search.toLowerCase()) ||
          teacher.email.toLowerCase().includes(search.toLowerCase()) ||
          teacher.school.toLowerCase().includes(search.toLowerCase())
      )
    : teachers;

  const activeCount = teachers?.filter((t) => t.active).length || 0;
  const inactiveCount = teachers?.filter((t) => !t.active).length || 0;

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Back Button */}
      <Link
        href="/admin"
        className="inline-flex items-center text-[#E3B23C] hover:text-[#C9962A] mb-4 text-sm sm:text-base"
      >
        <svg
          className="w-5 h-5 mr-1"
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
        Back to Admin Dashboard
      </Link>

      {/* Header */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2E2815] mb-3">
          Manage Teachers
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-green-50 rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-700">
              {activeCount}
            </div>
            <div className="text-xs sm:text-sm text-green-700/70">Active</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-red-700">
              {inactiveCount}
            </div>
            <div className="text-xs sm:text-sm text-red-700/70">Inactive</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-4 mb-4">
        <form method="get" className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name, email, or school..."
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold px-6 py-2 rounded-lg transition-colors min-h-[48px] flex items-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          {search && (
            <Link
              href="/admin/teachers"
              className="bg-gray-300 hover:bg-gray-400 text-[#2E2815] font-semibold px-6 py-2 rounded-lg transition-colors min-h-[48px] flex items-center"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Teachers List */}
      <TeachersList teachers={filteredTeachers || []} />
    </div>
  );
}
