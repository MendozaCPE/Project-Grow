import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const supabase = await createClient();
  const { submissionId } = await params;

  // Simply redirect to the Word export
  // This route exists for backward compatibility but just downloads Word format
  return NextResponse.redirect(new URL(`/api/export/${submissionId}`, request.url));
}
