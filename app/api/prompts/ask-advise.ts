type Msg = { role: 'system'|'user'|'assistant'; content: string };

export default function askAdvisePrompt(
  stack: Array<{ role: 'system'|'user'; content: string }>,
  dbContext?: string
): Msg[] {
  const system: Msg = {
    role: 'system',
    content:
      'You provide practical, empathetic social advice grounded in prior context.\n' +
      (dbContext ? `\n=== USER'S DATABASE ===\n${dbContext}\n\n` : '') +
      'Be concise and actionable. If needed, ask a single clarifying question.',
  };
  const history: Msg[] = stack.map((m) => ({ role: m.role, content: m.content }));
  return [system, ...history];
}


