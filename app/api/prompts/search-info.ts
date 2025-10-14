type Msg = { role: 'system'|'user'|'assistant'; content: string };

export default function searchInfoPrompt(stack: Array<{ role: 'system'|'user'; content: string }>): Msg[] {
  const system: Msg = {
    role: 'system',
    content:
      'You search within the user\'s existing data and summarize relevant items.\n' +
      'If you need disambiguation, ask one clarifying question.\n' +
      'Keep answers concise and focused on the request.',
  };
  const history: Msg[] = stack.map((m) => ({ role: m.role, content: m.content }));
  return [system, ...history];
}


