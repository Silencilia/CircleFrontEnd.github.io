export interface ExistingSentimentInput {
  id: string;
  label: string;
  category?: string;
}

export interface SummarizeDraftResponse {
  title: string;
  text: string;
  sentiments: {
    existing_ids: string[];
    new_labels: string[];
  };
}

export async function summarizeDraft(input: {
  title?: string;
  text: string;
  existingSentiments: ExistingSentimentInput[];
  selectedContacts?: Array<{ id: string; name: string }>;
}): Promise<SummarizeDraftResponse> {
  const started = Date.now();
  console.log('[summarizeDraft] Request', { titleLen: (input.title || '').length, textLen: input.text.length, existingSentiments: input.existingSentiments.length, selectedContacts: input.selectedContacts?.length || 0 });
  const res = await fetch('/api/summarize-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const elapsed = Date.now() - started;
  console.log('[summarizeDraft] Response status', { ok: res.ok, status: res.status, ms: elapsed });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`summarizeDraft failed: ${err}`);
  }
  const json = await res.json();
  console.log('[summarizeDraft] Response body keys', Object.keys(json || {}));
  if (!json?.ok || !json?.result) {
    throw new Error('summarizeDraft returned invalid response');
  }
  console.log('[summarizeDraft] Parsed result', {
    titleLen: (json.result.title || '').length,
    textLen: (json.result.text || '').length,
    existingCount: json.result.sentiments?.existing_ids?.length || 0,
    newCount: json.result.sentiments?.new_labels?.length || 0,
  });
  return json.result as SummarizeDraftResponse;
}


