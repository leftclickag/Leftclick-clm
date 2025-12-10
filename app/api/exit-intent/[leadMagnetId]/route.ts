import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { leadMagnetId: string } }
) {
  try {
    const supabase = await createClient();
    const { leadMagnetId } = params;

    // Get exit intent config
    const { data: config, error } = await supabase
      .from("exit_intent_configs")
      .select("*")
      .eq("lead_magnet_id", leadMagnetId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // If no config, return disabled state
    if (!config) {
      return NextResponse.json({ enabled: false });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Exit intent config error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exit intent config" },
      { status: 500 }
    );
  }
}

