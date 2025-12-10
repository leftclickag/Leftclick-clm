import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

interface WebhookPayload {
  event: string;
  submission_id: string;
  data: Record<string, any>;
}

class WebhookService {
  async triggerWebhook(
    tenantId: string,
    event: string,
    payload: WebhookPayload
  ) {
    const supabase = await createClient();

    // Get active webhooks for this tenant and event
    const { data: webhooks } = await supabase
      .from("webhooks")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .contains("events", [event]);

    if (!webhooks) return;

    for (const webhook of webhooks) {
      try {
        const signature = this.generateSignature(
          JSON.stringify(payload),
          webhook.secret || ""
        );

        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Event": event,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.statusText}`);
        }
      } catch (error: any) {
        console.error(`Webhook error for ${webhook.url}:`, error);
        // Log error but don't fail the request
      }
    }
  }

  private generateSignature(payload: string, secret: string): string {
    if (!secret) return "";
    return crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
  }

  verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

export const webhookService = new WebhookService();

