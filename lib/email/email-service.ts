import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter() {
    if (this.transporter) return this.transporter;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    return this.transporter;
  }

  async sendEmail(options: EmailOptions) {
    const transporter = await this.getTransporter();
    return transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@leftclick.de",
      ...options,
    });
  }

  async sendToQueue(
    submissionId: string,
    toEmail: string,
    subject: string,
    body: string
  ) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    await supabase.from("email_queue").insert({
      submission_id: submissionId,
      to_email: toEmail,
      subject,
      body,
      status: "pending",
    });
  }

  async processQueue() {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: pendingEmails } = await supabase
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .limit(10);

    if (!pendingEmails) return;

    for (const email of pendingEmails) {
      try {
        await this.sendEmail({
          to: email.to_email,
          subject: email.subject,
          html: email.body,
        });

        await supabase
          .from("email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", email.id);
      } catch (error: any) {
        await supabase
          .from("email_queue")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", email.id);
      }
    }
  }
}

export const emailService = new EmailService();

