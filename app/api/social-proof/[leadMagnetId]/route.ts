import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { leadMagnetId: string } }
) {
  try {
    const supabase = await createClient();
    const { leadMagnetId } = params;

    // Get social proof stats
    const { data: stats, error } = await supabase
      .from("social_proof_stats")
      .select("*")
      .eq("lead_magnet_id", leadMagnetId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw error;
    }

    // If no stats yet, return defaults
    if (!stats) {
      return NextResponse.json({
        total_completions: 0,
        today_completions: 0,
        this_week_completions: 0,
        last_completion_at: null,
        avg_completion_time_seconds: null,
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Social proof error:", error);
    return NextResponse.json(
      { error: "Failed to fetch social proof stats" },
      { status: 500 }
    );
  }
}

