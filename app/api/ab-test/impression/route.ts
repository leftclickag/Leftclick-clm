import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { variant_id } = await request.json();

    if (!variant_id) {
      return NextResponse.json(
        { error: "variant_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Increment impression count
    const { error } = await supabase.rpc("increment_variant_impressions", {
      p_variant_id: variant_id,
    });

    if (error) {
      // If RPC doesn't exist, fall back to direct update
      await supabase
        .from("lead_magnet_variants")
        .update({ impressions: supabase.rpc("increment", { x: 1 }) })
        .eq("id", variant_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("A/B test impression error:", error);
    return NextResponse.json(
      { error: "Failed to record impression" },
      { status: 500 }
    );
  }
}

