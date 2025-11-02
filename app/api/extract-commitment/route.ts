import { NextRequest, NextResponse } from 'next/server';
import extractCommitmentPrompt from '@/app/api/prompts/extract-commitment';
import { extractCommitmentsTool } from '@/app/api/utils/functionTools';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text } = body as {
      text?: string;
    };
    console.log('[API:extract-commitment] Request received', {
      textLen: (text || '').length,
    });

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Missing or invalid text' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    const system = extractCommitmentPrompt();
    
    // Add current date/time context for relative date resolution
    const now = new Date();
    const currentDateStr = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }); // e.g., "Nov 1, 2025"
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const userContent = `Current date and time: ${currentDateStr} ${currentTimeStr}
Draft text:\n${text}\n\nReturn ONLY a function call to extract_commitments. Do not include prose outside the tool call.`;

    console.log('[API:extract-commitment] Sending request with context', {
      currentDate: currentDateStr,
      currentTime: currentTimeStr,
    });

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
          { role: 'user', content: userContent },
        ],
        tools: [extractCommitmentsTool],
        tool_choice: { type: 'function', function: { name: 'extract_commitments' } },
      }),
    });

    const t1 = Date.now();
    console.log('[API:extract-commitment] OpenAI responded', { ok: response.ok, status: response.status, ms: t1 - t0 });
    if (!response.ok) {
      const errText = await response.text();
      console.error('[API:extract-commitment] OpenAI error response', { status: response.status, error: errText });
      return NextResponse.json({ error: `OpenAI error: ${errText}` }, { status: 502 });
    }

    const data = await response.json();
    console.log('[API:extract-commitment] Raw OpenAI keys', Object.keys(data || {}));
    const toolCalls = data?.choices?.[0]?.message?.tool_calls || [];
    let argsJson: string | undefined;
    if (Array.isArray(toolCalls) && toolCalls.length > 0) {
      const first = toolCalls[0];
      if (first?.function?.name === 'extract_commitments') {
        argsJson = first?.function?.arguments;
      }
    } else {
      // Fallback: try to parse message content as JSON if tool call was not used
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === 'string') argsJson = content;
    }

    if (!argsJson) {
      console.error('[API:extract-commitment] No tool call or content returned', { 
        toolCallsCount: toolCalls.length,
        hasContent: !!data?.choices?.[0]?.message?.content 
      });
      return NextResponse.json({ error: 'No tool call or content returned' }, { status: 502 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(argsJson);
    } catch (e) {
      console.error('[API:extract-commitment] JSON parse error', { error: e, argsJson: argsJson.substring(0, 200) });
      // Try to salvage JSON from text
      const match = argsJson.match(/\{[\s\S]*\}$/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (e2) {
          console.error('[API:extract-commitment] Failed to salvage JSON', { error: e2 });
          return NextResponse.json({ error: 'Malformed tool arguments' }, { status: 502 });
        }
      } else {
        return NextResponse.json({ error: 'Malformed tool arguments' }, { status: 502 });
      }
    }

    const commitments = Array.isArray(parsed?.commitments) ? parsed.commitments : [];
    
    console.log('[API:extract-commitment] Parsed commitments', {
      count: commitments.length,
      commitments: commitments.map((c: any) => ({
        text: c.text?.substring(0, 50),
        due_date: c.due_date,
        due_time: c.due_time,
      })),
    });
    
    // Validate and sanitize commitments
    const validCommitments = commitments
      .filter((c: any) => c && typeof c === 'object')
      .map((c: any) => ({
        text: String(c.text || '').trim(),
        due_date: String(c.due_date || '').trim(),
        due_time: String(c.due_time || '').trim(),
      }))
      .filter((c: any) => c.text.length > 0); // Only include commitments with text

    console.log('[API:extract-commitment] Valid commitments', {
      count: validCommitments.length,
      validCommitments: validCommitments.map((c: any) => ({
        text: c.text.substring(0, 50),
        due_date: c.due_date,
        due_time: c.due_time,
      })),
    });

    return NextResponse.json({
      ok: true,
      result: {
        commitments: validCommitments,
      },
    });
  } catch (err: any) {
    console.error('[API:extract-commitment] Error', err?.message, err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
