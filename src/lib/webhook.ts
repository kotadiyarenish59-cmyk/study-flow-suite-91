const WEBHOOK_URL =
  "https://connect.pabbly.com/webhook-listener/webhook/IjU3NjMwNTZmMDYzNzA0M2M1MjZmNTUzZCI_3D_pc/IjU3NjcwNTY4MDYzNTA0MzQ1MjY1NTUzZDUxM2Ii_pc";

export async function sendToWebhook(
  payload: Record<string, unknown>
): Promise<boolean> {
  // Strip 'id' and 'event' fields if present
  const { id, event, ...cleanPayload } = payload as Record<string, unknown>;

  const data = {
    ...cleanPayload,
  };

  try {
    // Send JSON payload to Pabbly Webhook
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("[Webhook] Sent data to Pabbly webhook:", data);
    return true;
  } catch (error) {
    console.warn("[Webhook] Standard fetch failed, attempting fallback send:", error);
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(data),
      });
      return true;
    } catch (fallbackErr) {
      console.error("[Webhook] Failed to send webhook:", fallbackErr);
      return false;
    }
  }
}
