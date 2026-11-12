import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TeachersList from "./TeachersList";

export default async function TeachersPage() {
  const supabase = await createClient();

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

  // Fetch all teachers with their auth emails and submission counts
  const { data: teachersData } = await supabase
    .from("profiles")
    .select(`
      *,
      submissions:submissions(id, status, deleted_at, session_id, lac_sessions(session_no, title))
    `)
    .eq("role", "teacher")
    .order("full_name");

  // Fetch auth users to get emails
  const { data: authUsers } = await supabase.auth.admin.listUsers();

  // Combine teacher data with emails
  const teachers = teachersData?.map(teacher => {
    const authUser = authUsers?.users.find(u => u.id === teacher.id);
    const submissions = teacher.submissions?.filter((s: any) => !s.deleted_at && s.status === 'submitted') || [];
    
    return {
      ...teacher,
      email: authUser?.email || teacher.email || 'No email found',
      submissionCount: submissions.length,
      submissions: submissions
    };
  });

  return <TeachersList teachers={teachers || []} />;
}
