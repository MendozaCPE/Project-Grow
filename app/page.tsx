import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to appropriate dashboard
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      if (profile.role === "admin") {
        redirect("/admin");
      } else {
        redirect("/teacher");
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
      <div className="max-w-2xl w-full bg-[#FFFDF5] rounded-lg shadow-md p-8 sm:p-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2E2815] mb-4">
          Welcome to Project GROW
        </h2>
        <p className="text-lg text-[#2E2815]/80 mb-6">
          Learning Action Cell Form 4 Management System for DepEd Teachers
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-[#F3DC94]/30 rounded-lg border border-[#E3B23C]/20">
            <h3 className="font-semibold text-[#2E2815] mb-2">For Teachers</h3>
            <p className="text-sm text-[#2E2815]/80 mb-3">
              Submit and manage your LAC Form 4 submissions easily from any device.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/login"
              className="flex items-center justify-center min-h-[48px] px-6 py-3 bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold rounded-lg transition-colors"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="flex items-center justify-center min-h-[48px] px-6 py-3 bg-transparent hover:bg-[#F3DC94]/50 text-[#2E2815] font-semibold rounded-lg border-2 border-[#E3B23C] transition-colors"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
