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
      'IMPORTANT: When referencing contacts in your responses, always use their actual names (not contact IDs or tokens). ' +
      'The database context contains contact names that have been resolved from internal references.\n' +
      'If you need disambiguation, ask one clarifying question.\n' +
      'Keep answers concise and focused on the request.',
  };
  const history: Msg[] = stack.map((m) => ({ role: m.role, content: m.content }));
  return [system, ...history];
}


