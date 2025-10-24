type Msg = { role: 'system'|'user'|'assistant'; content: string };

export default function searchInfoPrompt(
  stack: Array<{ role: 'system'|'user'; content: string }>,
  dbContext?: string
): Msg[] {
  const system: Msg = {
    role: 'system',
    content:
      'You search within the user\'s existing data and summarize relevant items.\n' +
      (dbContext ? `\n=== USER'S DATABASE ===\n${dbContext}\n\n` : '') +
      'IMPORTANT:\n' +
      '- Write your final answer in natural language. Do not include raw IDs in the prose.\n' +
      '- When your answer relies on specific contacts and/or notes from the database, you MUST call the tools reference_contacts and/or reference_notes with their UUIDs (found in the database context).\n' +
      '- In the prose, refer to contacts by their actual names (not IDs).\n' +
      'If you need disambiguation, ask one clarifying question.\n' +
      'Keep answers concise and focused on the request.',
  };
  const history: Msg[] = stack.map((m) => ({ role: m.role, content: m.content }));
  return [system, ...history];
}


