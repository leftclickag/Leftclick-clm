/**
 * Helper-Funktion zum Triggern eines Lead-Push
 * Diese Funktion wird von Widgets aufgerufen, wenn ein Lead completed wurde
 */
export async function triggerLeadPush(
  submissionId: string,
  event: string = "lead.completed"
) {
  try {
    // Non-blocking: wir warten nicht auf das Ergebnis
    // Der Lead-Push erfolgt asynchron im Hintergrund
    fetch("/api/integrations/push-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submissionId,
        event,
      }),
    }).catch((error) => {
      // Silent fail: Log nur in Konsole
      console.error("Lead push trigger failed:", error);
    });
  } catch (error) {
    // Silent fail: Der Lead-Push sollte nicht den Hauptprozess blockieren
    console.error("Lead push trigger error:", error);
  }
}



