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
export const setMessageTypeTool = {
  type: 'function' as const,
  function: {
    name: 'set_message_type',
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
 * All reference tools combined
 */
export const referenceTools = [referenceContactsTool, referenceNotesTool];

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

  return { contactIds, noteIds };
}
