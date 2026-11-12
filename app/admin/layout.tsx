import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/teacher");
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FBF6E4] via-white to-[#F3DC94]/20">
      <Sidebar userRole="admin" userName={profile.full_name || "Admin"} />
      <main className="flex-1 lg:ml-72 overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

