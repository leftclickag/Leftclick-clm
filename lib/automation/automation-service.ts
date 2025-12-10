import { createClient } from "@/lib/supabase/server";
import { notificationService } from "@/lib/notifications/notification-service";

interface AutomationStep {
  id: string;
  step_order: number;
  delay_minutes: number;
  action_type: "send_email" | "send_webhook" | "send_slack" | "update_score" | "add_tag";
  config: Record<string, any>;
}

interface AutomationExecution {
  id: string;
  automation_id: string;
  submission_id: string;
  current_step: number;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "failed";
  next_execution_at: string | null;
}

class AutomationService {
  // Trigger automation based on event
  async triggerAutomation(
    tenantId: string,
    leadMagnetId: string,
    submissionId: string,
    eventType: "completed" | "abandoned" | "started" | "step_complete",
    eventData?: Record<string, any>
  ) {
    const supabase = await createClient();

    // Find matching automations
    const { data: automations } = await supabase
      .from("email_automations")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("lead_magnet_id", leadMagnetId)
      .eq("trigger_event", eventType)
      .eq("active", true);

    if (!automations || automations.length === 0) return;

    for (const automation of automations) {
      // Check trigger conditions
      if (!this.checkConditions(automation.trigger_conditions, eventData)) {
        continue;
      }

      // Check if automation already running for this submission
      const { data: existing } = await supabase
        .from("automation_executions")
        .select("id")
        .eq("automation_id", automation.id)
        .eq("submission_id", submissionId)
        .in("status", ["pending", "in_progress"])
        .single();

      if (existing) continue; // Already running

      // Get first step
      const { data: steps } = await supabase
        .from("automation_steps")
        .select("*")
        .eq("automation_id", automation.id)
        .order("step_order");

      if (!steps || steps.length === 0) continue;

      const firstStep = steps[0];
      const nextExecutionAt = new Date(
        Date.now() + firstStep.delay_minutes * 60 * 1000
      ).toISOString();

      // Create execution
      await supabase.from("automation_executions").insert({
        automation_id: automation.id,
        submission_id: submissionId,
        current_step: 0,
        status: firstStep.delay_minutes === 0 ? "in_progress" : "pending",
        next_execution_at: nextExecutionAt,
      });

      // Execute immediately if no delay
      if (firstStep.delay_minutes === 0) {
        await this.executeStep(automation.id, submissionId, 0);
      }
    }
  }

  private checkConditions(
    conditions: Record<string, any>,
    data?: Record<string, any>
  ): boolean {
    if (!conditions || Object.keys(conditions).length === 0) return true;
    if (!data) return false;

    for (const [field, condition] of Object.entries(conditions)) {
      const value = data[field];
      
      if (typeof condition === "object") {
        if (condition.equals !== undefined && value !== condition.equals) return false;
        if (condition.gt !== undefined && value <= condition.gt) return false;
        if (condition.lt !== undefined && value >= condition.lt) return false;
        if (condition.contains !== undefined && !String(value).includes(condition.contains)) return false;
      } else {
        if (value !== condition) return false;
      }
    }

    return true;
  }

  // Execute automation step
  async executeStep(
    automationId: string,
    submissionId: string,
    stepOrder: number
  ) {
    const supabase = await createClient();

    // Get step details
    const { data: step } = await supabase
      .from("automation_steps")
      .select("*")
      .eq("automation_id", automationId)
      .eq("step_order", stepOrder)
      .single();

    if (!step) {
      // No more steps, mark as completed
      await supabase
        .from("automation_executions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("automation_id", automationId)
        .eq("submission_id", submissionId);
      return;
    }

    // Get submission data
    const { data: submission } = await supabase
      .from("submissions")
      .select("*, lead_magnets(*)")
      .eq("id", submissionId)
      .single();

    if (!submission) return;

    try {
      // Execute action based on type
      switch (step.action_type) {
        case "send_email":
          await this.executeSendEmail(step.config, submission);
          break;
        case "send_webhook":
          await this.executeSendWebhook(step.config, submission);
          break;
        case "send_slack":
          await this.executeSendSlack(step.config, submission);
          break;
        case "update_score":
          await this.executeUpdateScore(step.config, submission);
          break;
        case "add_tag":
          await this.executeAddTag(step.config, submission);
          break;
      }

      // Get next step
      const { data: nextStep } = await supabase
        .from("automation_steps")
        .select("*")
        .eq("automation_id", automationId)
        .eq("step_order", stepOrder + 1)
        .single();

      if (nextStep) {
        // Schedule next step
        const nextExecutionAt = new Date(
          Date.now() + nextStep.delay_minutes * 60 * 1000
        ).toISOString();

        await supabase
          .from("automation_executions")
          .update({
            current_step: stepOrder + 1,
            next_execution_at: nextExecutionAt,
            status: nextStep.delay_minutes === 0 ? "in_progress" : "pending",
          })
          .eq("automation_id", automationId)
          .eq("submission_id", submissionId);

        // Execute immediately if no delay
        if (nextStep.delay_minutes === 0) {
          await this.executeStep(automationId, submissionId, stepOrder + 1);
        }
      } else {
        // No more steps
        await supabase
          .from("automation_executions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("automation_id", automationId)
          .eq("submission_id", submissionId);
      }
    } catch (error) {
      console.error("Automation step failed:", error);
      await supabase
        .from("automation_executions")
        .update({ status: "failed" })
        .eq("automation_id", automationId)
        .eq("submission_id", submissionId);
    }
  }

  private async executeSendEmail(
    config: { email_template_id: string; subject_override?: string },
    submission: any
  ) {
    const supabase = await createClient();

    // Get email template
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", config.email_template_id)
      .single();

    if (!template) throw new Error("Email template not found");

    const toEmail = submission.contact_info?.email;
    if (!toEmail) throw new Error("No email address in submission");

    // Replace personalization tokens
    const subject = this.replaceTokens(
      config.subject_override || template.subject,
      submission
    );
    const body = this.replaceTokens(template.body_html, submission);

    // Queue email
    await supabase.from("email_queue").insert({
      submission_id: submission.id,
      to_email: toEmail,
      subject,
      body,
      status: "pending",
    });
  }

  private async executeSendWebhook(
    config: { url: string; headers?: Record<string, string> },
    submission: any
  ) {
    await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify({
        event: "automation_triggered",
        submission_id: submission.id,
        data: submission.data,
        contact_info: submission.contact_info,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  private async executeSendSlack(
    config: { channel_id: string; message?: string },
    submission: any
  ) {
    const supabase = await createClient();

    const { data: channel } = await supabase
      .from("notification_channels")
      .select("*")
      .eq("id", config.channel_id)
      .single();

    if (channel) {
      await notificationService.sendNotification(submission.tenant_id, {
        event_type: "new_lead",
        submission_id: submission.id,
        email: submission.contact_info?.email,
        lead_magnet_title: submission.lead_magnets?.title,
      });
    }
  }

  private async executeUpdateScore(
    config: { score_adjustment: number },
    submission: any
  ) {
    const supabase = await createClient();

    await supabase.rpc("adjust_lead_score", {
      p_submission_id: submission.id,
      p_adjustment: config.score_adjustment,
    });
  }

  private async executeAddTag(
    config: { tag_id: string },
    submission: any
  ) {
    const supabase = await createClient();

    await supabase.from("submission_tags").upsert({
      submission_id: submission.id,
      tag_id: config.tag_id,
    }, {
      onConflict: "submission_id, tag_id",
      ignoreDuplicates: true,
    });
  }

  private replaceTokens(text: string, submission: any): string {
    return text
      .replace(/\{\{first_name\}\}/g, submission.contact_info?.first_name || "")
      .replace(/\{\{last_name\}\}/g, submission.contact_info?.last_name || "")
      .replace(/\{\{email\}\}/g, submission.contact_info?.email || "")
      .replace(/\{\{company\}\}/g, submission.contact_info?.company || "")
      .replace(/\{\{lead_magnet_title\}\}/g, submission.lead_magnets?.title || "")
      .replace(/\{\{result\}\}/g, JSON.stringify(submission.result || {}));
  }

  // Process pending executions (called by cron job)
  async processPendingExecutions() {
    const supabase = await createClient();

    const { data: executions } = await supabase
      .from("automation_executions")
      .select("*")
      .eq("status", "pending")
      .lte("next_execution_at", new Date().toISOString());

    if (!executions) return;

    for (const execution of executions) {
      await supabase
        .from("automation_executions")
        .update({ status: "in_progress" })
        .eq("id", execution.id);

      await this.executeStep(
        execution.automation_id,
        execution.submission_id,
        execution.current_step
      );
    }
  }

  // Cancel automation for a submission
  async cancelAutomation(submissionId: string) {
    const supabase = await createClient();

    await supabase
      .from("automation_executions")
      .update({ status: "cancelled" })
      .eq("submission_id", submissionId)
      .in("status", ["pending", "in_progress"]);
  }
}

export const automationService = new AutomationService();

