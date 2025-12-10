import { NextResponse } from "next/server";
import { emailService } from "@/lib/email/email-service";

export async function POST() {
  try {
    await emailService.processQueue();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

