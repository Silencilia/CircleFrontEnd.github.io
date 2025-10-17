type Msg = { role: 'system'|'user'|'assistant'; content: string };

export default function recordEventPrompt(
  stack: Array<{ role: 'system'|'user'; content: string }>,
  dbContext?: string
): Msg[] {
  const system: Msg = {
    role: 'system',
    content:
      'You help the user record a recent event succinctly.\n' +
      (dbContext ? `\n=== USER'S DATABASE ===\n${dbContext}\n\n` : '') +
      'Respond with a brief confirmation and any clarifying questions if needed.\n' +
      'Keep responses concise. If details are missing, ask one targeted question.',
  };
  const history: Msg[] = stack.map((m) => ({ role: m.role, content: m.content }));
  return [system, ...history];
}


