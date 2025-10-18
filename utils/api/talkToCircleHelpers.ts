/**
 * Helper functions for TalkToCircle component
 */

/**
 * Processes user message intent and gets AI response
 * @param chatId - The chat ID
 * @param messageId - The message ID
 * @param onSystemMessage - Optional callback to handle system response for offline mode
 * @param localData - Optional local data for offline mode
 * @returns Response with ok status and optional content
 */
export async function identifyRequest(
  chatId: string,
  messageId: string,
  onSystemMessage?: (content: string) => void,
  localData?: any,
  onThinkingChange?: (isThinking: boolean) => void
): Promise<{ ok: boolean; content?: string } | { ok: false; error: string }> {
  try {
    console.log('[identifyRequest] Called with chatId:', chatId, 'messageId:', messageId, 'hasLocalData:', !!localData);
    
    // Set thinking to true when request starts
    onThinkingChange?.(true);
    
    const body: any = { chatId, messageId };
    if (localData) {
      body.localData = localData;
    }

    // Get cached user ID from sessionStorage
    const userId = sessionStorage.getItem('userId');

    const headers: any = { 'Content-Type': 'application/json' };
    if (userId) {
      headers['X-User-ID'] = userId;
    }

    const res = await fetch('/api/intents/process', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // Set thinking to false on error
      onThinkingChange?.(false);
      return { ok: false, error: err?.error || 'Request failed' } as const;
    }
    const data = await res.json().catch(() => ({}));

    console.log('[identifyRequest] API response received:', { ok: data?.ok, hasContent: !!data?.content });

    // Set thinking to false when request completes
    onThinkingChange?.(false);

    // If there's content in the response and a callback, invoke it (for offline mode)
    if (data?.content && onSystemMessage) {
      console.log('[identifyRequest] Calling onSystemMessage callback with content length:', data.content.length);
      onSystemMessage(data.content);
    }

    return { ok: !!data?.ok, content: data?.content } as const;
  } catch (e: any) {
    // Set thinking to false on error
    onThinkingChange?.(false);
    return { ok: false, error: e?.message || 'Unknown error' } as const;
  }
}
