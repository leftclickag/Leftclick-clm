import { NextRequest, NextResponse } from "next/server";
import { webhookService } from "@/lib/webhooks/webhook-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("X-Webhook-Signature") || "";
    const event = request.headers.get("X-Webhook-Event") || "";

    // Verify signature if needed
    // const isValid = webhookService.verifySignature(body, signature, secret);

    const payload = JSON.parse(body);
    
    // Process webhook based on event type
    // This is for incoming webhooks, not outgoing
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

