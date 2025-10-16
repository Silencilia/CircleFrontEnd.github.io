/**
 * Helper functions for TalkToCircle component
 */

/**
 * Processes user message intent and gets AI response
 * @param chatId - The chat ID
 * @param messageId - The message ID
 * @param onSystemMessage - Optional callback to handle system response for offline mode
 * @returns Response with ok status and optional content
 */
export async function identifyRequest(
  chatId: string, 
  messageId: string,
  onSystemMessage?: (content: string) => void
): Promise<{ ok: boolean; content?: string } | { ok: false; error: string }> {
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
    
    // If there's content in the response and a callback, invoke it (for offline mode)
    if (data?.content && onSystemMessage) {
      onSystemMessage(data.content);
    }
    
    return { ok: !!data?.ok, content: data?.content } as const;
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unknown error' } as const;
  }
}

