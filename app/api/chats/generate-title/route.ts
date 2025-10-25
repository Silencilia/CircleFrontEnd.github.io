import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function sanitizeTitle(raw: string): string {
  let title = (raw || '').trim();
  // Remove surrounding quotes/backticks
  if ((title.startsWith('"') && title.endsWith('"')) || (title.startsWith("'") && title.endsWith("'")) || (title.startsWith('`') && title.endsWith('`'))) {
    title = title.slice(1, -1).trim();
  }
  // Collapse whitespace
  title = title.replace(/\s+/g, ' ').trim();
  // Remove trailing punctuation commonly added by models
  title = title.replace(/[\s\-–—:;,.!?]+$/g, '').trim();
  // Cap length to ~80 chars
  if (title.length > 80) title = title.slice(0, 80).trim();
  return title;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { chatId, text } = body as { chatId?: string; text?: string };

    if (!chatId || typeof chatId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid chatId' }, { status: 400 });
    }
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Missing or invalid text' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    // Limit prompt size
    const snippet = text.trim().slice(0, 800);

    const messages = [
      {
        role: 'system',
        content:
          'You generate a concise, human-readable chat title from the first user message. 2–7 words, natural language, no quotes, no emojis, no hashtags. Return ONLY the title text.',
      },
      {
        role: 'user',
        content: `Create a short title summarizing this inquiry:\n\n${snippet}`,
      },
    ];

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `OpenAI error: ${errText}` }, { status: 502 });
    }

    const data = await response.json();
    const rawContent: string = data?.choices?.[0]?.message?.content ?? '';
    let title = sanitizeTitle(rawContent);
    if (!title) {
      // Fallback: derive from the user's first message snippet
      title = sanitizeTitle(snippet.slice(0, 80));
    }

    // Update the chat title in Supabase (server-side client)
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { error } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId);

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to update chat' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, title });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


