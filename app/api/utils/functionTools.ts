/**
 * Function calling tools for AI to reference contacts and notes in responses
 */

export interface ReferenceToolCall {
  function: string;
  arguments: {
    entity_ids: string[];
  };
}

/**
 * Tool for referencing contacts in AI responses
 */
export const referenceContactsTool = {
  type: 'function' as const,
  function: {
    name: 'reference_contacts',
    description: 'Reference specific contacts in your response. Call this when your answer is based on information from specific contacts.',
    parameters: {
      type: 'object',
      properties: {
        entity_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of contact UUIDs to reference'
        }
      },
      required: ['entity_ids'],
      additionalProperties: false,
    },
  },
};

/**
 * Tool for referencing notes in AI responses
 */
export const referenceNotesTool = {
  type: 'function' as const,
  function: {
    name: 'reference_notes',
    description: 'Reference specific notes in your response. Call this when your answer is based on information from specific notes.',
    parameters: {
      type: 'object',
      properties: {
        entity_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of note UUIDs to reference'
        }
      },
      required: ['entity_ids'],
      additionalProperties: false,
    },
  },
};

/**
 * Tool for classifying user message intent
 */
export const identifyIntentTool = {
  type: 'function' as const,
  function: {
    name: 'identify_intent',
    description: 'Classify the user\'s message into a type.',
    parameters: {
      type: 'object',
      properties: {
        intention: { type: 'string', enum: ['record','search','advice'] },
      },
      required: ['intention'],
      additionalProperties: false,
    },
  },
};


/**
 * Unified tool for forcing citations in a single call (both contacts and notes)
 */
export const referenceEntitiesTool = {
  type: 'function' as const,
  function: {
    name: 'reference_entities',
    description: 'Return ALL UUIDs (contacts and notes) that support the assistant\'s answer. Arrays can be empty.',
    parameters: {
      type: 'object',
      properties: {
        contacts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of contact UUIDs referenced by the answer',
        },
        notes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of note UUIDs referenced by the answer',
        },
      },
      required: ['contacts', 'notes'],
      additionalProperties: false,
    },
  },
};

/**
 * Tool for extracting commitments from draft text
 */
export const extractCommitmentsTool = {
  type: 'function' as const,
  function: {
    name: 'extract_commitments',
    description: 'Extract all commitments, tasks, and to-do items from the draft text, preserving contact tokens and extracting due dates/times.',
    parameters: {
      type: 'object',
      properties: {
        commitments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'Concise description of the commitment, preserving any {{contact:UUID}} tokens exactly.',
              },
              due_date: {
                type: 'string',
                description: 'Due date in format "Dec 20, 2024" or empty string if not specified.',
              },
              due_time: {
                type: 'string',
                description: 'Due time in format "16:00" or empty string if not specified.',
              },
            },
            required: ['text', 'due_date', 'due_time'],
            additionalProperties: false,
          },
          description: 'Array of commitments found in the text. Empty array if none found.',
        },
      },
      required: ['commitments'],
      additionalProperties: false,
    },
  },
};

/**
 * Tool for summarizing draft text with sentiment mapping
 */
export const summarizeDraftTool = {
  type: 'function' as const,
  function: {
    name: 'summarize_draft',
    description: 'Return a structured, concise summary for the draft, preserving contact tokens and mapping sentiments.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short, informative title. ≤ 8 words.' },
        text: { type: 'string', description: 'Summarized content, preserving any {{contact:UUID}} tokens exactly.' },
        sentiments: {
          type: 'object',
          properties: {
            existing_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'UUIDs of existing sentiments chosen from the catalog.',
              maxItems: 3,
            },
            new_labels: {
              type: 'array',
              items: { type: 'string' },
              description: 'New sentiment labels when catalog has no match.',
              maxItems: 3,
            },
          },
          required: ['existing_ids', 'new_labels'],
          additionalProperties: false,
        },
      },
      required: ['title', 'text', 'sentiments'],
      additionalProperties: false,
    },
  },
};

export function extractEntitiesFromToolCalls(toolCalls: any[]): { contacts: string[]; notes: string[] } {
  let contacts: string[] = [];
  let notes: string[] = [];
  if (!Array.isArray(toolCalls)) return { contacts, notes };
  for (const toolCall of toolCalls) {
    try {
      if (toolCall?.function?.name !== 'reference_entities') continue;
      const argsJson = toolCall?.function?.arguments;
      if (!argsJson) continue;
      const args = JSON.parse(argsJson);
      const c = Array.isArray(args?.contacts) ? args.contacts : [];
      const n = Array.isArray(args?.notes) ? args.notes : [];
      contacts = c;
      notes = n;
    } catch (error) {
      console.error('Error parsing reference_entities tool call:', error);
    }
  }
  console.log('[toolcalls] extractEntitiesFromToolCalls summary', {
    toolCallsCount: Array.isArray(toolCalls) ? toolCalls.length : 0,
    contactsCount: contacts.length,
    notesCount: notes.length,
    contacts,
    notes,
  });
  return { contacts, notes };
}

/**
 * Extract references from OpenAI tool calls
 */
export function extractReferencesFromToolCalls(toolCalls: any[]): {
  contactIds: string[];
  noteIds: string[];
} {
  const contactIds: string[] = [];
  const noteIds: string[] = [];

  if (!Array.isArray(toolCalls)) {
    return { contactIds, noteIds };
  }

  for (const toolCall of toolCalls) {
    try {
      const functionName = toolCall?.function?.name;
      const argsJson = toolCall?.function?.arguments;

      if (!functionName || !argsJson) continue;

      const args = JSON.parse(argsJson);
      const entityIds = args?.entity_ids;

      if (!Array.isArray(entityIds)) continue;

      if (functionName === 'reference_contacts') {
        contactIds.push(...entityIds);
      } else if (functionName === 'reference_notes') {
        noteIds.push(...entityIds);
      }
    } catch (error) {
      console.error('Error parsing tool call:', error);
    }
  }

  console.log('[toolcalls] extractReferencesFromToolCalls summary', {
    toolCallsCount: Array.isArray(toolCalls) ? toolCalls.length : 0,
    contactIdsCount: contactIds.length,
    noteIdsCount: noteIds.length,
    contactIds,
    noteIds,
  });
  return { contactIds, noteIds };
}
