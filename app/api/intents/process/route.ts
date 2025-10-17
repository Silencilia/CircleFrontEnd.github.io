import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

import identifyPrompt from '@/app/api/prompts/intent-identify';
import recordEventPrompt from '@/app/api/prompts/record-event';
import searchInfoPrompt from '@/app/api/prompts/search-info';
import askAdvisePrompt from '@/app/api/prompts/ask-advise';
import { getRelevantContext } from '@/app/api/utils/retrieveRelevantData';

type IntentEnum = 'record' | 'search' | 'advice';

async function callOpenAI(messages: Array<{ role: 'system'|'user'|'assistant'; content: string }>, temperature = 0.1) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  try {
    console.log('[intents/process] openai.chat.completions request', {
      messagesCount: messages.length,
      temperature,
    });
  } catch {}
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
    try {
      console.error('[intents/process] openai.chat.completions error', {
        status: response.status,
        body: errText,
      });
    } catch {}
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
  try {
    console.log('[intents/process] openai.chat.completions (tools) request', {
      messagesCount: args.messages.length,
      toolsCount: args.tools?.length ?? 0,
      temperature: args.temperature ?? 0,
    });
  } catch {}
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
    try {
      console.error('[intents/process] openai.chat.completions (tools) error', {
        status: response.status,
        body: errText,
      });
    } catch {}
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
  // Use direct Postgres via fetch to Supabase REST? We are inside Next Route; prefer Supabase client normally,
  // but to avoid importing the client in server route, we can call the Next.js internal API that already uses it elsewhere.
  // For simplicity here, we will call Supabase REST; however, project does not have REST key in env. So instead, we rely on an RPC via your existing server runtime is not set up.
  // Therefore, we will fetch via direct SQL is not possible here; use a lightweight approach by calling a local internal route is out of scope.
  // Pragmatic approach: Use the supabase-js client colocated in server. We'll dynamic import to avoid bundling issues.
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !anon) {
    try {
      console.error('[intents/process] fetchChatStack missing env', {
        hasUrl: !!url,
        hasServiceOrAnon: !!anon,
      });
    } catch {}
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
    try {
      console.error('[intents/process] fetchChatStack supabase error', error);
    } catch {}
    // Return empty array instead of throwing to support local-only chats
    return [];
  }
  return data || [];
}

async function insertSystemMessage(chatId: string, text: string) {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !anon) {
    try {
      console.error('[intents/process] insertSystemMessage missing env - skipping DB write for offline mode', {
        hasUrl: !!url,
        hasServiceOrAnon: !!anon,
      });
    } catch {}
    // Skip DB write for offline mode - response will be returned to client via response body
    return;
  }
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { error } = await supabase.from('chat_messages').insert({
    chat_id: chatId,
    role: 'system',
    text,
    parts: null,
    status: 'final',
  });
  if (error) {
    try {
      console.error('[intents/process] insertSystemMessage supabase error - continuing anyway for offline mode', error);
    } catch {}
    // Don't throw - allow offline mode to continue
    return;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { chatId, messageId, localData } = body as { chatId?: string; messageId?: string; localData?: any };
    if (!chatId || !messageId) {
      return NextResponse.json({ error: 'Missing chatId or messageId' }, { status: 400 });
    }

    // Get user ID from header (cached on client-side)
    const userId = req.headers.get('X-User-ID') || undefined;

    // 1) Load full chat stack from DB
    const rows = await fetchChatStack(chatId);
    const stack = rows.map(mapDbRowToChatMessage).filter(Boolean) as Array<{ role: 'system'|'user'; content: string }>;

    // 2) Identify intent
    const identifyMessages = identifyPrompt(stack);
    // Define the classification tool
    const tools = [{
      type: 'function',
      function: {
        name: 'set_message_type',
        description: 'Classify the user\'s message into a type.',
        parameters: {
          type: 'object',
          properties: {
            intention: { type: 'string', enum: ['record','search','advice'] },
          },
          required: ['intention'],
          additionalProperties: false,
        },
      },
    }];
    const identifyData = await callOpenAIWithTools({ messages: identifyMessages, tools, temperature: 0 });
    try {
      console.log('[intents/process] identify.message', JSON.stringify(identifyData?.choices?.[0]?.message ?? null));
    } catch {}
    let intentStr: IntentEnum = 'advice';
    const toolCalls = identifyData?.choices?.[0]?.message?.tool_calls;
    try {
      console.log('[intents/process] identify.tool_calls', JSON.stringify(toolCalls ?? null));
    } catch {}
    if (Array.isArray(toolCalls) && toolCalls.length) {
      const first = toolCalls[0];
      const argsJson = first?.function?.arguments;
      try {
        console.log('[intents/process] identify.tool_call.arguments', argsJson);
      } catch {}
      try {
        const args = JSON.parse(argsJson);
        const v = args?.intention;
        if (v === 'record' || v === 'search' || v === 'advice') intentStr = v;
        try {
          console.log('[intents/process] identify.parsed_from_tool_call', intentStr);
        } catch {}
      } catch {}
    } else {
      // Fallback: try to parse content as JSON (in case model returned JSON instead of tool call)
      const content: string = identifyData?.choices?.[0]?.message?.content ?? '';
      try {
        console.log('[intents/process] identify.fallback.content', content);
      } catch {}
      try {
        const parsed = JSON.parse(content);
        const v = (parsed?.intention ?? parsed?.intent);
        if (v === 'record' || v === 'search' || v === 'advice') intentStr = v;
        try {
          console.log('[intents/process] identify.parsed_from_content', intentStr);
        } catch {}
      } catch {}
    }

    // 3) Retrieve relevant database context via semantic search
    const latestUserMessage = stack[stack.length - 1]?.content || '';
    console.log('[intents/process] Starting context retrieval:', {
      latestUserMessage,
      userId: userId || 'none',
      hasLocalData: !!localData,
      localDataKeys: localData ? Object.keys(localData) : []
    });
    
    const dbContext = await getRelevantContext(
      latestUserMessage,
      userId,
      localData,
      20 // top 20 most relevant items
    );
    
    console.log('[intents/process] Retrieved context:', {
      contextLength: dbContext?.length || 0,
      contextPreview: dbContext?.substring(0, 200) + '...',
      isEmpty: !dbContext || dbContext.trim() === ''
    });

    // 4) Dispatch to scenario handler WITH context
    let scenarioMessages: Array<{ role: 'system'|'user'|'assistant'; content: string }> = [];
    if (intentStr === 'record') {
      scenarioMessages = recordEventPrompt(stack, dbContext);
    } else if (intentStr === 'search') {
      scenarioMessages = searchInfoPrompt(stack, dbContext);
    } else {
      scenarioMessages = askAdvisePrompt(stack, dbContext);
    }
    try {
      console.log('[intents/process] identify.final_intent', intentStr);
    } catch {}

    const scenarioContent = await callOpenAI(scenarioMessages, 0.2);

    // 5) Insert system message (will skip if offline/no DB)
    await insertSystemMessage(chatId, scenarioContent || '(no content)');

    // Return the response content for offline clients to store locally
    return NextResponse.json({ ok: true, intent: intentStr, content: scenarioContent || '(no content)' });
  } catch (err: any) {
    try {
      console.error('[intents/process] handler error', {
        message: err?.message,
        stack: err?.stack,
      });
    } catch {}
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


