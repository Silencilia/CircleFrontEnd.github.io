import { NextRequest, NextResponse } from 'next/server';
import summarizeDraftPrompt from '@/app/api/prompts/summarize-draft';
import { summarizeDraftTool } from '@/app/api/utils/functionTools';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

type ExistingSentiment = { id: string; label: string; category?: string };
type SelectedContact = { id: string; name: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, text, existingSentiments, selectedContacts } = body as {
      title?: string;
      text?: string;
      existingSentiments?: ExistingSentiment[];
      selectedContacts?: SelectedContact[];
    };
    console.log('[API:summarize-draft] Request received', {
      hasTitle: !!title,
      textLen: (text || '').length,
      existingSentiments: Array.isArray(existingSentiments) ? existingSentiments.length : 0,
      selectedContacts: Array.isArray(selectedContacts) ? selectedContacts.length : 0,
    });

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Missing or invalid text' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    const system = summarizeDraftPrompt(
      Array.isArray(existingSentiments) ? existingSentiments : [],
      Array.isArray(selectedContacts) ? selectedContacts : []
    );
    const userParts: string[] = [];
    if (title && title.trim()) userParts.push(`Provided title:\n${title.trim()}`);
    userParts.push('Draft text:');
    userParts.push(text);
    userParts.push('\nReturn ONLY a function call to summarize_draft. Do not include prose outside the tool call.');

    const t0 = Date.now();
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userParts.join('\n\n') },
        ],
        tools: [summarizeDraftTool],
        tool_choice: { type: 'function', function: { name: 'summarize_draft' } },
      }),
    });

    const t1 = Date.now();
    console.log('[API:summarize-draft] OpenAI responded', { ok: response.ok, status: response.status, ms: t1 - t0 });
    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `OpenAI error: ${errText}` }, { status: 502 });
    }

    const data = await response.json();
    console.log('[API:summarize-draft] Raw OpenAI keys', Object.keys(data || {}));
    const toolCalls = data?.choices?.[0]?.message?.tool_calls || [];
    let argsJson: string | undefined;
    if (Array.isArray(toolCalls) && toolCalls.length > 0) {
      const first = toolCalls[0];
      if (first?.function?.name === 'summarize_draft') {
        argsJson = first?.function?.arguments;
      }
    } else {
      // Fallback: try to parse message content as JSON if tool call was not used
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === 'string') argsJson = content;
    }

    if (!argsJson) {
      return NextResponse.json({ error: 'No tool call or content returned' }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(argsJson);
    } catch (e) {
      // Try to salvage JSON from text
      const match = argsJson.match(/\{[\s\S]*\}$/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return NextResponse.json({ error: 'Malformed tool arguments' }, { status: 502 });
      }
    }

    const outTitle = String(parsed?.title ?? '').trim();
    const outText = String(parsed?.text ?? '').trim();
    const sentiments = parsed?.sentiments ?? {};
    const existing_ids = Array.isArray(sentiments?.existing_ids) ? sentiments.existing_ids.map(String) : [];
    const new_labels = Array.isArray(sentiments?.new_labels) ? sentiments.new_labels.map(String) : [];
    console.log('[API:summarize-draft] Parsed fields', {
      titleLen: outTitle.length,
      textLen: outText.length,
      existingCount: existing_ids.length,
      newCount: new_labels.length,
    });

    // Enforce limits and basic sanitation
    const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
    const limitedExisting = uniq(existing_ids).slice(0, 3);
    const limitedNew = uniq(new_labels).slice(0, Math.max(0, 3 - limitedExisting.length));

    if (!outText) {
      return NextResponse.json({ error: 'Model returned empty text' }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      result: {
        title: outTitle,
        text: outText,
        sentiments: {
          existing_ids: limitedExisting,
          new_labels: limitedNew,
        },
      },
    });
  } catch (err: any) {
    console.error('[API:summarize-draft] Error', err?.message);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


