import { NextRequest, NextResponse } from "next/server";
import { automationService } from "@/lib/automation/automation-service";

// This endpoint should be called by a cron job (e.g., every minute)
// Set up in Vercel cron or external cron service
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process pending automation executions
    await automationService.processPendingExecutions();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Automation processing error:", error);
    return NextResponse.json(
      { error: "Failed to process automations" },
      { status: 500 }
    );
  }
}

// Also support GET for simple cron services
export async function GET(request: NextRequest) {
  return POST(request);
}

