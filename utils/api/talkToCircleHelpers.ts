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
): Promise<
  | { ok: boolean; content?: string; intent?: 'record'|'search'|'advice'; references?: { contacts: string[]; notes: string[] } }
  | { ok: false; error: string }
> {
  const startTime = Date.now();
  console.log(`[PERF] Client: Starting API request at ${new Date().toISOString()}`);
  
  try {
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

    const fetchStart = Date.now();
    const res = await fetch('/api/intents/process', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const fetchTime = Date.now() - fetchStart;
    console.log(`[PERF] Client: API fetch completed in ${fetchTime}ms`);
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // Set thinking to false on error
      onThinkingChange?.(false);
      const totalTime = Date.now() - startTime;
      console.log(`[PERF] Client: Request failed after ${totalTime}ms`);
      return { ok: false, error: err?.error || 'Request failed' } as const;
    }
    
    const data = await res.json().catch(() => ({}));
    console.log('[Client] identifyRequest response', {
      ok: data?.ok,
      intent: data?.intent,
      hasContent: !!data?.content,
      references: data?.references,
    });

    // Set thinking to false when request completes
    onThinkingChange?.(false);

    // If there's content in the response and a callback, invoke it (for offline mode)
    if (data?.content && onSystemMessage) {
      onSystemMessage(data.content);
    }

    const totalTime = Date.now() - startTime;
    console.log(`[PERF] Client: Total request time ${totalTime}ms (${totalTime/1000}s)`);

    return {
      ok: !!data?.ok,
      content: data?.content,
      intent: data?.intent,
      references: data?.references,
    } as const;
  } catch (e: any) {
    // Set thinking to false on error
    onThinkingChange?.(false);
    const totalTime = Date.now() - startTime;
    console.log(`[PERF] Client: Request error after ${totalTime}ms:`, e?.message);
    return { ok: false, error: e?.message || 'Unknown error' } as const;
  }
}
