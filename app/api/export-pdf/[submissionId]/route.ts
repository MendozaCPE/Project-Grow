import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import PDFDocument from "pdfkit";

const REGION = "IV-A CALABARZON";
const DIVISION = "Batangas";
const SCHOOL = "MALARUHATAN ELEMENTARY";
const DISTRICT = "Malaruhatan, Lian, Batangas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the submission with related data
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select(
        `
        *,
        profiles!submissions_teacher_id_fkey (
          full_name
        ),
        lac_sessions!submissions_session_id_fkey (
          session_no,
          session_date,
          title
        )
      `
      )
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";
    const isOwner = submission.teacher_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const answers = submission.answers;
    const teacherName = submission.profiles.full_name;
    const session = submission.lac_sessions;

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(16).font("Helvetica-Bold").text("LAC FORM 4", { align: "center" });
    doc.fontSize(10).font("Helvetica").text(
      "LEARNING ACTION CELL SESSION - DEPED BATANGAS",
      { align: "center" }
    );
    doc.moveDown(1);

    // Basic Information
    doc.fontSize(10).font("Helvetica-Bold").text("Teacher Information:");
    doc.font("Helvetica");
    doc.text(`Name: ${teacherName}`);
    doc.text(`Region: ${REGION}`);
    doc.text(`Division: ${DIVISION}`);
    doc.text(`School: ${SCHOOL}`);
    doc.text(`District: ${DISTRICT}`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Session Information:");
    doc.font("Helvetica");
    doc.text(`Session No: ${session.session_no}`);
    doc.text(`Title: ${session.title}`);
    doc.text(
      `Date: ${new Date(session.session_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`
    );
    doc.moveDown(1);

    // Part A
    doc.fontSize(12).font("Helvetica-Bold").text("PART A: Learning Session Assessment");
    doc.moveDown(0.5);

    const questions = [
      "1. Objectives were met.",
      "2. Time allotment was followed.",
      "3. Clear communication was established.",
      "4. Positive learning environment was achieved.",
      "5. Resources were appropriately utilized.",
      "6. Assessment was effectively administered.",
      "7. Overall learning experience was valuable.",
    ];

    const ratings = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

    questions.forEach((question, index) => {
      const qNum = index + 1;
      const rating = answers[`q${qNum}_rating`] || "Not answered";
      const comment = answers[`c${qNum}`] || "";

      doc.fontSize(10).font("Helvetica-Bold").text(question);
      doc.font("Helvetica").text(`Rating: ${rating}`);
      if (comment) {
        doc.text(`Comment: ${comment}`);
      }
      doc.moveDown(0.3);
    });

    doc.moveDown(0.5);

    // Part B
    doc.fontSize(12).font("Helvetica-Bold").text("PART B: Personal Reflection");
    doc.moveDown(0.5);

    const reflections = [
      { key: "b1", title: "1. What went well in this session?" },
      { key: "b2", title: "2. What could be improved?" },
      { key: "b3", title: "3. Action plan moving forward:" },
    ];

    reflections.forEach((item) => {
      doc.fontSize(10).font("Helvetica-Bold").text(item.title);
      doc.font("Helvetica").text(answers[item.key] || "Not answered");
      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown(1);
    doc.fontSize(8).font("Helvetica-Oblique").text(
      `Generated: ${new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      { align: "center" }
    );

    doc.end();

    // Wait for PDF generation to complete
    await new Promise((resolve) => doc.on("end", resolve));

    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="LAC_Form_4_${teacherName.replace(/\s+/g, "_")}_Session_${session.session_no}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
