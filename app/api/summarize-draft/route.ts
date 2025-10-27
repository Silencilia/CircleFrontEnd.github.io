import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

type ExistingSentiment = { id: string; label: string; category?: string };
type SelectedContact = { id: string; name: string };

function buildSystemPrompt(existingSentiments: ExistingSentiment[], selected: SelectedContact[]) {
  const catalog = existingSentiments
    .map((s) => `- ${s.label} [id:${s.id}]${s.category ? ` (category: ${s.category})` : ''}`)
    .join('\n');

  const selectedCatalog = selected
    .map((c) => `- ${c.name} [id:${c.id}]`)
    .join('\n');

  return [
    'You are an expert summarization assistant.',
    'Tasks:',
    '1) Identify the nature/source of the draft text. If it appears to be imported from external sources, prefix your summary with the appropriate label followed by a line break:',
    '   - If it looks like email exchanges (with From/To/Date/Subject headers or email format): start with "Email history:\\n"',
    '   - If it looks like chat/messaging history (timestamp + username patterns): start with "Chat history:\\n"',
    '   - If it looks like conversation audio transcript (speaker labels, conversational flow): start with "Conversation transcript:\\n"',
    '   - If it looks like meeting notes or minutes: start with "Meeting notes:\\n"',
    '   - For other identifiable formats, use an appropriate label like "Document excerpt:\\n" or "Article notes:\\n"',
    '   - If the content is a personal note or observation (not clearly from an external source), do NOT add any prefix.',
    '2) Summarize the provided draft text to capture the essence without losing key details.',
    '3) Strictly preserve any contact references of the form {{contact:UUID}} verbatim (same case, punctuation, spacing). Never alter, drop, or reformat them.',
    '4) If a person belongs to the SELECTED CONTACTS list below, whenever you refer to them you MUST output the token {{contact:UUID}} instead of their name.',
    '   - Do not output their real name for selected contacts.',
    '   - If their token already appears in the source, keep it exactly.',
    '   - Do NOT invent tokens for people not listed.',
    '5) If the provided title is empty or unhelpful, generate a short, informative title (≤ 8 words).',
    '6) Provide up to 3 sentiment labels for the summarized note.',
    '',
    'Sentiment policy:',
    '- Prefer reusing existing sentiments from the catalog below; when appropriate, choose from them and return their UUIDs.',
    '- If no existing sentiment matches well, create a new sentiment label (single word, human-readable).',
    '- Total sentiments (existing + new) must be ≤ 3.',
    '',
    'Existing sentiment catalog (prefer these when relevant):',
    catalog || '(none provided)',
    '',
    'SELECTED CONTACTS (always use tokens when you mention them):',
    selectedCatalog || '(none provided)',
  ].join('\n');
}

const summarizeTool = {
  type: 'function' as const,
  function: {
    name: 'summarize_draft',
    description: 'Return a structured, concise summary for the draft, preserving contact tokens and mapping sentiments.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short, informative title. ≤ 8 words.' },
        text: { type: 'string', description: 'Summarized content, preserving any {{contact:UUID}} tokens exactly.' },
        sentiments: {
          type: 'object',
          properties: {
            existing_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'UUIDs of existing sentiments chosen from the catalog.',
              maxItems: 3,
            },
            new_labels: {
              type: 'array',
              items: { type: 'string' },
              description: 'New sentiment labels when catalog has no match.',
              maxItems: 3,
            },
          },
          required: ['existing_ids', 'new_labels'],
          additionalProperties: false,
        },
      },
      required: ['title', 'text', 'sentiments'],
      additionalProperties: false,
    },
  },
};

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

    const system = buildSystemPrompt(
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
        tools: [summarizeTool],
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


