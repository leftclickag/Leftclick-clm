import { createClient } from "@/lib/supabase/server";

interface NotificationPayload {
  event_type: "new_lead" | "hot_lead" | "abandoned" | "conversion" | "daily_summary";
  submission_id?: string;
  lead_magnet_title?: string;
  email?: string;
  score?: number;
  grade?: string;
  custom_data?: Record<string, any>;
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: { type: string; text: string }[];
  elements?: any[];
}

class NotificationService {
  async sendNotification(tenantId: string, payload: NotificationPayload) {
    const supabase = await createClient();

    // Get active notification channels for this event
    const { data: triggers } = await supabase
      .from("notification_triggers")
      .select(`
        *,
        notification_channels!inner (*)
      `)
      .eq("event_type", payload.event_type)
      .eq("active", true)
      .eq("notification_channels.tenant_id", tenantId)
      .eq("notification_channels.active", true);

    if (!triggers || triggers.length === 0) return;

    for (const trigger of triggers) {
      const channel = trigger.notification_channels;
      const message = this.formatMessage(trigger.message_template, payload);

      try {
        switch (channel.channel_type) {
          case "slack":
            await this.sendSlackNotification(channel.webhook_url, payload, message);
            break;
          case "teams":
            await this.sendTeamsNotification(channel.webhook_url, payload, message);
            break;
          case "discord":
            await this.sendDiscordNotification(channel.webhook_url, payload, message);
            break;
          case "telegram":
            await this.sendTelegramNotification(channel.api_credentials, payload, message);
            break;
        }
      } catch (error) {
        console.error(`Notification failed for channel ${channel.id}:`, error);
      }
    }
  }

  private formatMessage(template: string, payload: NotificationPayload): string {
    return template
      .replace(/\{\{event_type\}\}/g, payload.event_type)
      .replace(/\{\{email\}\}/g, payload.email || "N/A")
      .replace(/\{\{lead_magnet\}\}/g, payload.lead_magnet_title || "N/A")
      .replace(/\{\{score\}\}/g, String(payload.score || 0))
      .replace(/\{\{grade\}\}/g, payload.grade || "N/A")
      .replace(/\{\{timestamp\}\}/g, new Date().toLocaleString("de-DE"));
  }

  private async sendSlackNotification(
    webhookUrl: string,
    payload: NotificationPayload,
    message: string
  ) {
    const gradeEmoji = this.getGradeEmoji(payload.grade);
    const eventEmoji = this.getEventEmoji(payload.event_type);

    const blocks: SlackBlock[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${eventEmoji} ${this.getEventTitle(payload.event_type)}`,
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Lead Magnet:*\n${payload.lead_magnet_title || "N/A"}`,
          },
          {
            type: "mrkdwn",
            text: `*E-Mail:*\n${payload.email || "N/A"}`,
          },
        ],
      },
    ];

    if (payload.score !== undefined) {
      blocks.push({
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Score:*\n${payload.score} Punkte`,
          },
          {
            type: "mrkdwn",
            text: `*Bewertung:*\n${gradeEmoji} ${this.getGradeLabel(payload.grade)}`,
          },
        ],
      });
    }

    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📅 ${new Date().toLocaleString("de-DE")}`,
        },
      ],
    });

    // Add action button if submission exists
    if (payload.submission_id) {
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Lead ansehen",
              emoji: true,
            },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads/${payload.submission_id}`,
            style: "primary",
          },
        ],
      });
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: message,
        blocks,
      }),
    });
  }

  private async sendTeamsNotification(
    webhookUrl: string,
    payload: NotificationPayload,
    message: string
  ) {
    const gradeEmoji = this.getGradeEmoji(payload.grade);

    const card = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: this.getGradeColor(payload.grade),
      summary: this.getEventTitle(payload.event_type),
      sections: [
        {
          activityTitle: `${this.getEventEmoji(payload.event_type)} ${this.getEventTitle(payload.event_type)}`,
          facts: [
            { name: "Lead Magnet", value: payload.lead_magnet_title || "N/A" },
            { name: "E-Mail", value: payload.email || "N/A" },
            ...(payload.score !== undefined
              ? [
                  { name: "Score", value: `${payload.score} Punkte` },
                  { name: "Bewertung", value: `${gradeEmoji} ${this.getGradeLabel(payload.grade)}` },
                ]
              : []),
            { name: "Zeitpunkt", value: new Date().toLocaleString("de-DE") },
          ],
          markdown: true,
        },
      ],
      potentialAction: payload.submission_id
        ? [
            {
              "@type": "OpenUri",
              name: "Lead ansehen",
              targets: [
                {
                  os: "default",
                  uri: `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads/${payload.submission_id}`,
                },
              ],
            },
          ]
        : [],
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
  }

  private async sendDiscordNotification(
    webhookUrl: string,
    payload: NotificationPayload,
    message: string
  ) {
    const embed = {
      title: `${this.getEventEmoji(payload.event_type)} ${this.getEventTitle(payload.event_type)}`,
      color: parseInt(this.getGradeColor(payload.grade).replace("#", ""), 16),
      fields: [
        { name: "Lead Magnet", value: payload.lead_magnet_title || "N/A", inline: true },
        { name: "E-Mail", value: payload.email || "N/A", inline: true },
        ...(payload.score !== undefined
          ? [
              { name: "Score", value: `${payload.score} Punkte`, inline: true },
              { name: "Bewertung", value: `${this.getGradeEmoji(payload.grade)} ${this.getGradeLabel(payload.grade)}`, inline: true },
            ]
          : []),
      ],
      timestamp: new Date().toISOString(),
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: message,
        embeds: [embed],
      }),
    });
  }

  private async sendTelegramNotification(
    credentials: { bot_token: string; chat_id: string },
    payload: NotificationPayload,
    message: string
  ) {
    const gradeEmoji = this.getGradeEmoji(payload.grade);
    const eventEmoji = this.getEventEmoji(payload.event_type);

    const text = `
${eventEmoji} *${this.getEventTitle(payload.event_type)}*

📋 *Lead Magnet:* ${payload.lead_magnet_title || "N/A"}
📧 *E-Mail:* ${payload.email || "N/A"}
${payload.score !== undefined ? `📊 *Score:* ${payload.score} Punkte\n${gradeEmoji} *Bewertung:* ${this.getGradeLabel(payload.grade)}` : ""}
📅 *Zeitpunkt:* ${new Date().toLocaleString("de-DE")}
    `.trim();

    await fetch(
      `https://api.telegram.org/bot${credentials.bot_token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: credentials.chat_id,
          text,
          parse_mode: "Markdown",
        }),
      }
    );
  }

  private getEventEmoji(eventType: string): string {
    const emojis: Record<string, string> = {
      new_lead: "🎉",
      hot_lead: "🔥",
      abandoned: "👋",
      conversion: "✅",
      daily_summary: "📊",
    };
    return emojis[eventType] || "📬";
  }

  private getEventTitle(eventType: string): string {
    const titles: Record<string, string> = {
      new_lead: "Neuer Lead!",
      hot_lead: "Heißer Lead!",
      abandoned: "Lead abgebrochen",
      conversion: "Conversion!",
      daily_summary: "Tägliche Zusammenfassung",
    };
    return titles[eventType] || "Neues Event";
  }

  private getGradeEmoji(grade?: string): string {
    const emojis: Record<string, string> = {
      hot: "🔥",
      warm: "☀️",
      cold: "❄️",
    };
    return emojis[grade || ""] || "❓";
  }

  private getGradeLabel(grade?: string): string {
    const labels: Record<string, string> = {
      hot: "Heißer Lead",
      warm: "Warmer Lead",
      cold: "Kalter Lead",
    };
    return labels[grade || ""] || "Nicht bewertet";
  }

  private getGradeColor(grade?: string): string {
    const colors: Record<string, string> = {
      hot: "#EF4444",
      warm: "#F59E0B",
      cold: "#3B82F6",
    };
    return colors[grade || ""] || "#6B7280";
  }

  // Send daily summary
  async sendDailySummary(tenantId: string) {
    const supabase = await createClient();

    // Get yesterday's stats
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    const { data: stats } = await supabase
      .from("daily_analytics")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("date", dateStr);

    if (!stats || stats.length === 0) return;

    const totals = stats.reduce(
      (acc, s) => ({
        impressions: acc.impressions + (s.impressions || 0),
        starts: acc.starts + (s.starts || 0),
        completions: acc.completions + (s.completions || 0),
        abandonments: acc.abandonments + (s.abandonments || 0),
      }),
      { impressions: 0, starts: 0, completions: 0, abandonments: 0 }
    );

    await this.sendNotification(tenantId, {
      event_type: "daily_summary",
      custom_data: {
        date: dateStr,
        ...totals,
        conversion_rate: totals.starts > 0 
          ? ((totals.completions / totals.starts) * 100).toFixed(1) 
          : 0,
      },
    });
  }
}

export const notificationService = new NotificationService();

