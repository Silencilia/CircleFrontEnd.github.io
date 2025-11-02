type ExistingSentiment = { id: string; label: string; category?: string };
type SelectedContact = { id: string; name: string };

export default function summarizeDraftPrompt(
  existingSentiments: ExistingSentiment[],
  selectedContacts: SelectedContact[]
): string {
  const catalog = existingSentiments
    .map((s) => `- ${s.label} [id:${s.id}]${s.category ? ` (category: ${s.category})` : ''}`)
    .join('\n');

  const selectedCatalog = selectedContacts
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


