export type ComponentKind = 'NameConfirm' | 'NoteCard' | 'ContactCard' | 'DraftCard';

export type ChatMessagePart =
  | { type: 'text'; text: string }
  | { type: 'component'; kind: ComponentKind; props: unknown };

export interface ChatEntry {
  id: string;
  role: 'user' | 'system' | 'tool';
  text?: string;
  parts?: ChatMessagePart[];
  createdAt: string; // ISO
}



