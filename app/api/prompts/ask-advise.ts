type Msg = { role: 'system'|'user'|'assistant'; content: string };

export default function askAdvisePrompt(stack: Array<{ role: 'system'|'user'; content: string }>): Msg[] {
  const system: Msg = {
    role: 'system',
    content:
      'You provide practical, empathetic social advice grounded in prior context.\n' +
      'Be concise and actionable. If needed, ask a single clarifying question.',
  };
  const history: Msg[] = stack.map((m) => ({ role: m.role, content: m.content }));
  return [system, ...history];
}


