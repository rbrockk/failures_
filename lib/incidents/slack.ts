import { Incident } from "./data"

export async function sendCriticalAlert(incident: Incident): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn("[Slack] SLACK_WEBHOOK_URL not configured. Skipping alert.")
    return
  }

  try {
    // Compact payload with incident link and probable cause
    const payload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🚨 ${incident.severity.toUpperCase()} Incident: ${incident.title}`,
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*ID:* <https://failures.internal/incidents/${incident.id}|${incident.id}>\n*Service:* \`${incident.service}\`\n*Description:* ${incident.description}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Probable Cause:* ${incident.rootCause?.category || 'Unknown'} - ${incident.rootCause?.description || 'Under investigation'}`
          }
        }
      ]
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      console.error(`[Slack] Failed to send alert: ${res.status} ${res.statusText}`)
    }
  } catch (err) {
    // No crash if webhook fails
    console.error("[Slack] Error sending alert:", err)
  }
}
