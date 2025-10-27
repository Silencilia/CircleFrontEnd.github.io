import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

import identifyPrompt from '@/app/api/prompts/intent-identify';
import recordEventPrompt from '@/app/api/prompts/record-event';
import searchInfoPrompt from '@/app/api/prompts/search-info';
import askAdvisePrompt from '@/app/api/prompts/ask-advise';
import { getRelevantContext } from '@/app/api/utils/retrieveRelevantData';
import { identifyIntentTool, referenceContactsTool, referenceNotesTool, extractReferencesFromToolCalls, referenceEntitiesTool, extractEntitiesFromToolCalls } from '@/app/api/utils/functionTools';
import type { ChatMessagePart } from '@/types/chat';

type IntentEnum = 'record' | 'search' | 'advice';

async function callOpenAI(messages: Array<{ role: 'system'|'user'|'assistant'; content: string }>, temperature = 0.1) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature,
      messages,
    }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error: ${errText}`);
  }
  
  const data = await response.json();
  const content: string = data?.choices?.[0]?.message?.content ?? '';
  return content;
}

async function callOpenAIWithTools(args: {
  messages: Array<{ role: 'system'|'user'|'assistant'; content: string }>;
  temperature?: number;
  tools: any[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: args.temperature ?? 0,
      messages: args.messages,
      tools: args.tools,
      tool_choice: args.tool_choice ?? 'auto',
    }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error: ${errText}`);
  }
  
  const data = await response.json();
  return data;
}

function mapDbRowToChatMessage(row: any): { role: 'system'|'user'; content: string } | null {
  const role = row.role === 'system' ? 'system' : row.role === 'user' ? 'user' : null;
  if (!role) return null;
  const text: string = row.text ?? '';
  if (!text.trim()) return null;
  return { role, content: text };
}

async function fetchChatStack(chatId: string) {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !anon) {
    // Return empty array for offline mode instead of throwing
    return [];
  }
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, text, parts, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  if (error) {
    // Return empty array instead of throwing to support local-only chats
    return [];
  }
  return data || [];
}

async function insertSystemMessage(chatId: string, payload: { text?: string; parts?: ChatMessagePart[] }) {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !anon) {
    // Skip DB write for offline mode - response will be returned to client via response body
    return;
  }
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await supabase.from('chat_messages').insert({
    chat_id: chatId,
    role: 'system',
    text: payload.text ?? null,
    parts: payload.parts ?? null,
    status: 'final',
  });
  if (error) {
    // Don't throw - allow offline mode to continue
    return;
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log(`[PERF] Starting intent processing pipeline at ${new Date().toISOString()}`);
  
  try {
    const body = await req.json().catch(() => ({}));
    const { chatId, messageId, localData } = body as { chatId?: string; messageId?: string; localData?: any };
    if (!chatId || !messageId) {
      return NextResponse.json({ error: 'Missing chatId or messageId' }, { status: 400 });
    }

    // Get user ID from header (cached on client-side)
    const userId = req.headers.get('X-User-ID') || undefined;

    // 1) Load full chat stack from DB
    const step1Start = Date.now();
    const rows = await fetchChatStack(chatId);
    const stack = rows.map(mapDbRowToChatMessage).filter(Boolean) as Array<{ role: 'system'|'user'; content: string }>;
    const step1Time = Date.now() - step1Start;
    console.log(`[PERF] Step 1 - Load chat stack: ${step1Time}ms (${stack.length} messages)`);

    // 2) Identify intent
    const step2Start = Date.now();
    const identifyMessages = identifyPrompt(stack);
    // Define the classification tool
    const tools = [identifyIntentTool];
    const identifyData = await callOpenAIWithTools({ messages: identifyMessages, tools, temperature: 0 });
    const step2Time = Date.now() - step2Start;
    console.log(`[PERF] Step 2 - Intent classification: ${step2Time}ms`);
    let intentStr: IntentEnum = 'advice';
    const toolCalls = identifyData?.choices?.[0]?.message?.tool_calls;
    if (Array.isArray(toolCalls) && toolCalls.length) {
      const first = toolCalls[0];
      const argsJson = first?.function?.arguments;
      try {
        const args = JSON.parse(argsJson);
        const v = args?.intention;
        if (v === 'record' || v === 'search' || v === 'advice') intentStr = v;
      } catch {}
    } else {
      // Fallback: try to parse content as JSON (in case model returned JSON instead of tool call)
      const content: string = identifyData?.choices?.[0]?.message?.content ?? '';
      try {
        const parsed = JSON.parse(content);
        const v = (parsed?.intention ?? parsed?.intent);
        if (v === 'record' || v === 'search' || v === 'advice') intentStr = v;
      } catch {}
    }

    // 3) Retrieve relevant database context via semantic search
    const step3Start = Date.now();
    const latestUserMessage = stack[stack.length - 1]?.content || '';
    
    const dbContext = await getRelevantContext(
      latestUserMessage,
      userId,
      localData,
      20 // top 20 most relevant items
    );
    const step3Time = Date.now() - step3Start;
    console.log(`[PERF] Step 3 - Context retrieval: ${step3Time}ms (context length: ${dbContext?.length || 0})`);

    // 4) Dispatch to scenario handler WITH context
    const step4Start = Date.now();
    let scenarioMessages: Array<{ role: 'system'|'user'|'assistant'; content: string }> = [];
    let scenarioContent = '';
    let parts: ChatMessagePart[] | undefined;

    console.log('[INTENT]', intentStr, { latestUserMessage: latestUserMessage.slice(0, 200) });
    if (intentStr === 'record') {
      // Skip server-side response for record intent - client handles the flow
      scenarioContent = '';
    } else if (intentStr === 'search') {
      // Pass 1: natural-language answer (no tools enforced)
      scenarioMessages = searchInfoPrompt(stack, dbContext);
      scenarioContent = await callOpenAI(scenarioMessages, 0.2);

      // Pass 2: force citations using a single unified tool
      const citationMessages: Array<{ role: 'system'|'user'|'assistant'; content: string }> = [
        {
          role: 'system',
          content:
            'You are a strict citation tool. Based on the user question, the database context, and the assistant answer, ' +
            'you MUST call reference_entities with ALL UUIDs (contacts, notes) that support the answer.\n' +
            '- The database context may include lines that end with an explicit tag like [id:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx].\n' +
            '- ONLY use those explicit [id:...] UUIDs.\n' +
            '- NEVER use display indices like 1., 2., 3. as IDs.\n' +
            '- If you cannot find any explicit [id:...] tags, return empty arrays.\n' +
            'Return ONLY the tool call and NO prose.',
        },
        ...(dbContext ? [{ role: 'system' as const, content: `=== USER'S DATABASE ===\n${dbContext}` }] : []),
        { role: 'user', content: stack[stack.length - 1]?.content || '' },
        { role: 'assistant', content: scenarioContent || '' },
      ];

      const citationData = await callOpenAIWithTools({
        messages: citationMessages,
        tools: [referenceEntitiesTool],
        tool_choice: { type: 'function', function: { name: 'reference_entities' } },
        temperature: 0,
      });
      console.log('[SEARCH:CITATIONS] raw response', JSON.stringify(citationData?.choices?.[0]?.message, null, 2));
      const toolCallsForced = citationData?.choices?.[0]?.message?.tool_calls ?? [];
      const { contacts, notes } = extractEntitiesFromToolCalls(toolCallsForced);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validContacts = (contacts || []).filter((id) => uuidRegex.test(String(id)));
      const validNotes = (notes || []).filter((id) => uuidRegex.test(String(id)));
      if ((contacts?.length || 0) !== validContacts.length || (notes?.length || 0) !== validNotes.length) {
        console.warn('[CITATIONS] Some IDs were discarded as non-UUIDs', { contacts, notes, validContacts, validNotes });
      }
      parts = [
        ...validContacts.map((id) => ({ type: 'component', kind: 'ContactCard', props: { id } } as ChatMessagePart)),
        ...validNotes.map((id) => ({ type: 'component', kind: 'NoteCard', props: { id } } as ChatMessagePart)),
      ];
      console.log('[SEARCH] scenarioContent length', scenarioContent?.length || 0, 'parts', parts?.length || 0);
    } else {
      // Pass 1: natural-language advice (no tools enforced)
      scenarioMessages = askAdvisePrompt(stack, dbContext);
      scenarioContent = await callOpenAI(scenarioMessages, 0.2);

      // Pass 2: force citations using a single unified tool
      const citationMessages: Array<{ role: 'system'|'user'|'assistant'; content: string }> = [
        {
          role: 'system',
          content:
            'You are a strict citation tool. Based on the user question, the database context, and the assistant answer, ' +
            'you MUST call reference_entities with ALL UUIDs (contacts, notes) that support the answer.\n' +
            '- The database context may include lines that end with an explicit tag like [id:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx].\n' +
            '- ONLY use those explicit [id:...] UUIDs.\n' +
            '- NEVER use display indices like 1., 2., 3. as IDs.\n' +
            '- If you cannot find any explicit [id:...] tags, return empty arrays.\n' +
            'Return ONLY the tool call and NO prose.',
        },
        ...(dbContext ? [{ role: 'system' as const, content: `=== USER'S DATABASE ===\n${dbContext}` }] : []),
        { role: 'user', content: stack[stack.length - 1]?.content || '' },
        { role: 'assistant', content: scenarioContent || '' },
      ];

      const citationData = await callOpenAIWithTools({
        messages: citationMessages,
        tools: [referenceEntitiesTool],
        tool_choice: { type: 'function', function: { name: 'reference_entities' } },
        temperature: 0,
      });
      console.log('[ADVICE:CITATIONS] raw response', JSON.stringify(citationData?.choices?.[0]?.message, null, 2));
      const toolCallsForced = citationData?.choices?.[0]?.message?.tool_calls ?? [];
      const { contacts, notes } = extractEntitiesFromToolCalls(toolCallsForced);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validContacts = (contacts || []).filter((id) => uuidRegex.test(String(id)));
      const validNotes = (notes || []).filter((id) => uuidRegex.test(String(id)));
      if ((contacts?.length || 0) !== validContacts.length || (notes?.length || 0) !== validNotes.length) {
        console.warn('[CITATIONS] Some IDs were discarded as non-UUIDs', { contacts, notes, validContacts, validNotes });
      }
      parts = [
        ...validContacts.map((id) => ({ type: 'component', kind: 'ContactCard', props: { id } } as ChatMessagePart)),
        ...validNotes.map((id) => ({ type: 'component', kind: 'NoteCard', props: { id } } as ChatMessagePart)),
      ];
      console.log('[ADVICE] scenarioContent length', scenarioContent?.length || 0, 'parts', parts?.length || 0);
    }
    const step4Time = Date.now() - step4Start;
    console.log(`[PERF] Step 4 - Scenario processing (${intentStr}): ${step4Time}ms`);

    // 5) Insert system message (will skip if offline/no DB or if record intent with no content)
    const step5Start = Date.now();
    console.log('[DB] inserting system message', { hasText: !!scenarioContent, partsCount: parts?.length || 0 });
    // Skip inserting empty messages for record intent (client handles the flow)
    if (intentStr !== 'record' || scenarioContent || (parts && parts.length > 0)) {
      await insertSystemMessage(chatId, { text: scenarioContent || undefined, parts });
    }
    const step5Time = Date.now() - step5Start;
    console.log(`[PERF] Step 5 - Database insert: ${step5Time}ms`);

    const totalTime = Date.now() - startTime;
    console.log(`[PERF] Total pipeline time: ${totalTime}ms (${totalTime/1000}s)`);

    // Return the response content for offline clients to store locally
    console.log('[RESPONSE] returning to client', { intent: intentStr, hasText: !!scenarioContent, partsCount: parts?.length || 0 });
    return NextResponse.json({
      ok: true,
      intent: intentStr,
      content: scenarioContent || '(no content)',
      references: parts ? {
        contacts: parts.filter((p: any) => p.type === 'component' && p.kind === 'ContactCard').map((p: any) => p.props.id),
        notes: parts.filter((p: any) => p.type === 'component' && p.kind === 'NoteCard').map((p: any) => p.props.id),
      } : { contacts: [], notes: [] },
    });
  } catch (err: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[PERF] Pipeline failed after ${totalTime}ms:`, err?.message);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


