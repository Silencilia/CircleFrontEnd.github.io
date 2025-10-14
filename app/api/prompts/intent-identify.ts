type Msg = { role: 'system'|'user'|'assistant'; content: string };

export default function identifyPrompt(stack: Array<{ role: 'system'|'user'; content: string }>): Msg[] {
  const system: Msg = {
    role: 'system',
    content:
      'You are an intent classifier. Use the provided function tool to return the classification.\n' +
      'Call set_message_type with the appropriate { intention } among: "record", "search", "advice".\n' +
      '- record: The user is logging a recent event they experienced (e.g., who, what activity, when, where, details).\n' +
      '- search: The user is seeking specific factual information already stored in Contacts or Notes and related stored info (e.g., lookup or retrieval).\n' +
      '- advice: The user wants guidance on a social decision using the full context of Contacts and Notes and related stored info.\n' +
      'Decide based primarily on the latest user message, but consider prior conversation context.\n' +
      'Always respond by calling the tool with exactly one intention. Do not produce free-form text.',
  };
  const history: Msg[] = stack.map((m) => ({ role: m.role, content: m.content }));
  return [system, ...history];
}


