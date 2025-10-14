/**
 * Helper functions for TalkToCircle component
 */

/**
 * Detects person names in text using OpenAI API
 * @param text - The text to analyze for names
 * @returns Array of detected names, or empty array on error
 */
export async function identifyRequest(chatId: string, messageId: string): Promise<{ ok: boolean } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/intents/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, messageId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err?.error || 'Request failed' } as const;
    }
    const data = await res.json().catch(() => ({}));
    return { ok: !!data?.ok } as const;
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unknown error' } as const;
  }
}

