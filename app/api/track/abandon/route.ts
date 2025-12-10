import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submission_id, event_type, timestamp } = body;

    if (!submission_id) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const supabase = await createClient();

    // Record tracking event
    await supabase.from("tracking_events").insert({
      submission_id,
      event_type: event_type || "potential_abandon",
      metadata: { timestamp, source: "beacon" },
    });

    // Update submission status if appropriate
    const { data: submission } = await supabase
      .from("submissions")
      .select("status")
      .eq("id", submission_id)
      .single();

    // Only mark as abandoned if not already completed
    if (submission && submission.status !== "completed") {
      await supabase
        .from("submissions")
        .update({ status: "abandoned" })
        .eq("id", submission_id)
        .in("status", ["started", "in_progress"]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Abandon tracking error:", error);
    // Return success anyway to not break sendBeacon
    return NextResponse.json({ success: true });
  }
}

