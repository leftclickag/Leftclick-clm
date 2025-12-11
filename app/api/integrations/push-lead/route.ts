import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiPushService } from "@/lib/api-integration/api-push-service";

/**
 * API-Route zum Pushen eines Leads an externe Systeme
 * Diese Route wird automatisch aufgerufen, wenn eine Submission completed wird
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, event = "lead.completed" } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: "submissionId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Hole Submission mit allen relevanten Daten
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      console.error("Submission not found:", submissionError);
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Pushe Lead an alle aktiven Integrationen
    await apiPushService.pushLead(submission, event);

    return NextResponse.json({
      success: true,
      message: "Lead push initiated",
      submissionId,
    });
  } catch (error: any) {
    console.error("Error in push-lead API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


