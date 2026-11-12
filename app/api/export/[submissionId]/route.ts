import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { readFile } from "fs/promises";
import { join } from "path";
import type { LACFormAnswers } from "@/lib/lacForm4";

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const supabase = await createClient();
  const { submissionId } = await params;

  // 1. Check logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Load submission with teacher profile and session
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select(
      `
      *,
      profiles!submissions_teacher_id_fkey (
        full_name
      ),
      lac_sessions (
        id,
        session_no,
        session_date,
        title
      )
    `
    )
    .eq("id", submissionId)
    .is("deleted_at", null as any)
    .single();

  if (submissionError || !submission) {
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 }
    );
  }

  // Check authorization
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = userProfile?.role === "admin";
  const isOwner = submission.teacher_id === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { error: "You do not have permission to export this submission" },
      { status: 403 }
    );
  }

  try {
    // 3. Prepare template data
    const answers = submission.answers as LACFormAnswers;
    const session = submission.lac_sessions;
    const teacherName = submission.profiles.full_name;

    // Format date for filename and document
    const sessionDate = new Date(session.session_date);
    const formattedDate = sessionDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const filenameDatePart = sessionDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // Build template data with rating checkmarks
    const templateData: Record<string, string> = {
      name: answers.name || "",
      session_id: `LAC-${session.session_no}`,
      date: formattedDate,
      session_no: session.session_no.toString(),
      region: "IV-A CALABARZON",
      division: "Batangas",
    };

    // Add rating checkmarks for q1-q7
    const ratings = ["sd", "d", "n", "a", "sa"];
    for (let i = 1; i <= 7; i++) {
      const questionKey = `q${i}` as keyof LACFormAnswers;
      const selectedRating = answers[questionKey]?.toLowerCase();

      ratings.forEach((rating) => {
        const key = `q${i}_${rating}`;
        templateData[key] = selectedRating === rating ? "✓" : "";
      });
    }

    // Add comments c1-c7
    for (let i = 1; i <= 7; i++) {
      const commentKey = `c${i}` as keyof LACFormAnswers;
      templateData[`c${i}`] = (answers[commentKey] as string) || "";
    }

    // Add Part B reflections b1-b3
    templateData.b1 = answers.b1 || "";
    templateData.b2 = answers.b2 || "";
    templateData.b3 = answers.b3 || "";

    // 4. Load template and fill with docxtemplater
    const templatePath = join(
      process.cwd(),
      "templates",
      "LAC-FORM-4-template.docx"
    );
    const content = await readFile(templatePath);
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      delimiters: { start: "{{", end: "}}" },
      linebreaks: true,
      paragraphLoop: true,
    });

    doc.render(templateData);

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // 5. Return as download
    const filename = `LAC-Form-4_${teacherName.replace(/\s+/g, "_")}_${filenameDatePart}.docx`;

    return new NextResponse(buffer as BodyInit, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating Word document:", error);
    return NextResponse.json(
      {
        error: "Failed to generate Word document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
