import { NextRequest, NextResponse } from 'next/server';

// We use the official OpenAI REST API via fetch to avoid adding heavy SDK deps
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function buildPrompt(text: string) {
  return `You are a careful name detector.
Extract all likely HUMAN PERSON NAMES from the following text. Return ONLY a valid JSON array of distinct strings, no commentary.

Rules:
- Include first names, last names, and full names
- Include nicknames and common shortened versions
- Exclude organizations, places, dates, product names
- Exclude titles unless they are part of the written name (e.g., "Dr. Brown" → "Brown" is acceptable, prefer the name without the title)
- Do not infer names that are not explicitly present

Text:
"""
${text}
"""`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text } = body as { text?: string };

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Missing or invalid "text"' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    const prompt = buildPrompt(text.trim());

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        messages: [
          { role: 'system', content: 'You return only valid JSON with no commentary.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `OpenAI error: ${errorText}` }, { status: 502 });
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '[]';

    let names: string[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        names = parsed.filter((n) => typeof n === 'string').map((n) => n.trim()).filter(Boolean);
      }
    } catch {
      // If the model returned non-JSON by mistake, try to salvage with a basic regex
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            names = parsed.filter((n) => typeof n === 'string').map((n) => n.trim()).filter(Boolean);
          }
        } catch {}
      }
    }

    // Deduplicate while preserving order
    const seen = new Set<string>();
    const unique = names.filter((n) => {
      const key = n.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ names: unique });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


