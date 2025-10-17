# Fix AI Database Access with Semantic Search (Phase 2)

## Problem
The AI API doesn't have access to your contact database. When processing queries, only chat history is sent to OpenAI - no contact data, notes, relationships, or other database information is included.

## Solution Architecture
Implement a two-phase approach with pre-computed embeddings:
1. **Semantic Search Phase**: Use pgvector embeddings to find relevant database content based on user query
2. **LLM Processing Phase**: Pass relevant context + chat history to OpenAI for generating responses
3. **Real-Time Embeddings**: Auto-generate embeddings on data create/update
4. **Sign-In Sync**: Sync embeddings after user authentication to catch any missed records

## Implementation Steps

### 1. Add SQL Function for Vector Similarity Search

**Execute in Supabase SQL Editor:**

```sql
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 20,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id text,
  entity_type text,
  entity_id text,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.entity_type,
    e.entity_id,
    e.content,
    e.metadata,
    1 - (e.embedding <=> query_embedding) as similarity
  FROM embeddings e
  WHERE (filter_user_id IS NULL OR e.user_id = filter_user_id)
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 2. Create Semantic Search Utility

**New File:** `app/api/utils/semanticSearch.ts`

Functions:
- `generateEmbedding(text: string): Promise<number[]>` - Generate embedding using OpenAI API
- `cosineSimilarity(a: number[], b: number[]): number` - Calculate similarity between vectors
- `searchWithPgVector(query, userId, topK)` - Use pgvector for fast search
- `searchOnTheFly(query, userId, topK)` - Fallback: fetch all data and search in-memory

### 3. Create Database Context Formatter

**New File:** `app/api/utils/formatDbContext.ts`

Functions to convert database records into LLM-readable text:
- `formatDatabaseContext(searchResults, allData): string` - Format all relevant data
- `formatContact(contact, relatedData): string` - Format individual contact
- `formatNote(note, relatedData): string` - Format individual note
- `formatCommitment(commitment, relatedData): string` - Format commitment

Output format example:
```
=== CONTACTS (3 found) ===
1. John Doe
   - Occupation: Software Engineer at TechCorp
   - Relationships: Friend, Colleague
   - Subjects: Technology, Hiking
   - Last interaction: 2024-10-15

=== NOTES (2 found) ===
[2024-10-10] Lunch with John Doe
   Content: Discussed new AI project...
   Sentiments: positive, excited

=== COMMITMENTS (1 found) ===
- Follow up with John about project (Due: 2024-10-20)
```

### 4. Create Relevant Data Retrieval Orchestrator

**New File:** `app/api/utils/retrieveRelevantData.ts`

Main function: `getRelevantContext(userQuery, userId, localData?, topK): Promise<string>`

Logic:
1. Check if localData provided (offline mode) or query Supabase
2. Generate embedding for user query
3. Try pgvector search first, fallback to on-the-fly if embeddings table empty
4. Fetch full records for matched entity IDs
5. Include related entities (contacts for notes, etc.)
6. Format into readable context string
7. Implement token counting and truncation (max 8000 tokens)

### 5. Create Embedding Management Utilities

**New File:** `app/api/utils/embeddingSync.ts`

Functions for embedding lifecycle:

```typescript
// Generate and store embedding for a single entity
async function generateAndStoreEmbedding(params: {
  userId: string;
  entityType: 'contact' | 'note' | 'commitment' | 'draft';
  entityId: string;
  content: string;
  metadata?: any;
}): Promise<void>

// Sync all embeddings for a user
async function syncUserEmbeddings(userId: string): Promise<{
  created: number;
  updated: number;
  skipped: number;
}>

// Delete embedding for deleted entity
async function deleteEmbedding(entityId: string): Promise<void>

// Helper: Build searchable content string for each entity type
function buildEntityContent(entityType, entityData, relatedData): string
```

Implementation notes:
- Rate limit API calls (batch embeddings in groups of 100)
- Check existing embeddings by entity_id to avoid duplicates
- Store metadata for debugging (entity name, creation date, etc.)

### 6. Create Embedding API Routes

**New File:** `app/api/embeddings/generate/route.ts`

POST endpoint for generating individual embeddings:
```typescript
export async function POST(req: NextRequest) {
  // Verify authentication
  // Extract entityType, entityId, content from request
  // Call generateAndStoreEmbedding()
  // Return success/error
}
```

**New File:** `app/api/embeddings/sync/route.ts`

POST endpoint for bulk embedding sync:
```typescript
export async function POST(req: NextRequest) {
  // Verify authentication
  // Get user ID from session
  // Call syncUserEmbeddings(userId)
  // Return sync statistics
}
```

### 7. Integrate Embedding Generation into Data Operations

**Modified File:** `data/supabaseDataService.ts`

Add embedding generation after successful create/update:

```typescript
async addNote(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
  // Existing insert logic
  const { data, error } = await supabase.from('notes').insert(...).select().single();
  
  if (data) {
    // Generate and store embedding (fire-and-forget)
    const content = buildNoteContent(data, relatedData);
    fetch('/api/embeddings/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'note',
        entityId: data.id,
        content,
      })
    }).catch(err => console.error('Embedding generation failed:', err));
  }
  
  return data;
}
```

Apply similar changes to:
- `addContact`, `updateContact`
- `updateNote`
- `addCommitment`, `updateCommitment`
- `deleteContact`, `deleteNote` (call deleteEmbedding)

### 8. Add Embedding Sync Trigger on Sign-In

**Modified File:** `contexts/ContactContext.tsx`

In `loadData` function after authentication:

```typescript
const loadData = async () => {
  dispatch({ type: 'SET_LOADING', payload: true });
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    dataServiceRef.current = supabaseDataService;
    
    // Trigger embedding sync in background
    fetch('/api/embeddings/sync', { method: 'POST' })
      .then(res => res.json())
      .then(result => console.log('Embedding sync:', result))
      .catch(err => console.error('Embedding sync failed:', err));
  } else {
    dataServiceRef.current = localStorageDataService;
  }
  
  const data = await dataServiceRef.current.getAllData();
  dispatch({ type: 'SET_DATA', payload: data });
};
```

### 9. Update Prompt Functions

**Modified Files:**
- `app/api/prompts/search-info.ts`
- `app/api/prompts/ask-advise.ts`
- `app/api/prompts/record-event.ts`

Update signatures to accept dbContext:

```typescript
export default function searchInfoPrompt(
  stack: Array<{ role: 'system'|'user'; content: string }>,
  dbContext?: string
): Msg[] {
  const system: Msg = {
    role: 'system',
    content:
      'You search within the user\'s existing data and summarize relevant items.\n' +
      (dbContext ? `\n=== USER'S DATABASE ===\n${dbContext}\n\n` : '') +
      'If you need disambiguation, ask one clarifying question.\n' +
      'Keep answers concise and focused on the request.',
  };
  const history: Msg[] = stack.map((m) => ({ role: m.role, content: m.content }));
  return [system, ...history];
}
```

### 10. Integrate Semantic Search into Intent Processing

**Modified File:** `app/api/intents/process/route.ts`

After identifying intent (around line 237):

```typescript
// Get user ID for filtering embeddings
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(url, anon, { auth: { persistSession: false } });
const { data: { user } } = await supabase.auth.getUser();

// Extract localData if provided (offline mode)
const localData = body.localData;

// Retrieve relevant database context via semantic search
const latestUserMessage = stack[stack.length - 1]?.content || '';
const dbContext = await getRelevantContext(
  latestUserMessage,
  user?.id || '',
  localData,
  20 // top 20 most relevant items
);

// Dispatch to scenario handler WITH context
let scenarioMessages: Array<...> = [];
if (intentStr === 'record') {
  scenarioMessages = recordEventPrompt(stack, dbContext);
} else if (intentStr === 'search') {
  scenarioMessages = searchInfoPrompt(stack, dbContext);
} else {
  scenarioMessages = askAdvisePrompt(stack, dbContext);
}
```

### 11. Update Client to Send Local Data When Offline

**Modified File:** `components/TalkToCircle.tsx`

In `handleSend` function, check if offline and send local data:

```typescript
const handleSend = async () => {
  const text = value.trim();
  if (!text) return;
  
  // ... existing message creation logic ...
  
  // Check if offline
  const { data: userRes } = await supabase.auth.getUser();
  const isOffline = !userRes.user?.id;
  
  if (isOffline) {
    // Gather local storage data
    const localData = {
      contacts: JSON.parse(localStorage.getItem('contacts') || '[]'),
      notes: JSON.parse(localStorage.getItem('notes') || '[]'),
      subjects: JSON.parse(localStorage.getItem('subjects') || '[]'),
      organizations: JSON.parse(localStorage.getItem('organizations') || '[]'),
      occupations: JSON.parse(localStorage.getItem('occupations') || '[]'),
      relationships: JSON.parse(localStorage.getItem('relationships') || '[]'),
      sentiments: JSON.parse(localStorage.getItem('sentiments') || '[]'),
      commitments: JSON.parse(localStorage.getItem('commitments') || '[]'),
      drafts: JSON.parse(localStorage.getItem('drafts') || '[]'),
    };
    
    identifyRequest(chat.chatId, messageId, (content) => {
      chat.addSystemText(content);
    }, localData);
  } else {
    identifyRequest(chat.chatId, messageId);
  }
};
```

**Modified File:** `utils/talkToCircleHelpers.ts`

Update `identifyRequest` to accept and pass localData:

```typescript
export async function identifyRequest(
  chatId: string,
  messageId: string,
  onSystemMessage?: (content: string) => void,
  localData?: any
): Promise<{ ok: boolean; content?: string } | { ok: false; error: string }> {
  try {
    const body: any = { chatId, messageId };
    if (localData) {
      body.localData = localData;
    }
    
    const res = await fetch('/api/intents/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    // ... rest of existing logic ...
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unknown error' };
  }
}
```

## Implementation Order

**Phase 1: Core Infrastructure** (First Priority)
1. Add SQL function for vector similarity
2. Create semantic search utility
3. Create database context formatter
4. Create relevant data retrieval orchestrator
5. Update prompt functions
6. Integrate with intents processing

**Phase 2: Real-Time Embeddings** (Second Priority)
7. Create embedding management utilities
8. Create embedding API routes
9. Integrate embedding generation into data operations
10. Add sign-in sync checkpoint

**Phase 3: Offline Support** (Third Priority)
11. Update client to send local data when offline
12. Test offline mode with local storage

## Technical Decisions

1. **Embedding Model**: OpenAI text-embedding-3-small (1536 dimensions, cost-effective)
2. **Similarity Metric**: Cosine similarity via pgvector `<=>` operator
3. **Top K**: Start with 20 most relevant items
4. **Tables to Embed**: All tables (contacts, notes, subjects, relationships, organizations, occupations, sentiments, commitments, drafts)
5. **Embedding Strategy**: Pre-compute embeddings with on-the-fly fallback
6. **Sync Timing**: On sign-in + after each create/update operation
7. **Token Limit**: 8000 tokens for database context (with truncation)

## Files to Create

1. `app/api/utils/semanticSearch.ts` - Core semantic search logic with pgvector
2. `app/api/utils/formatDbContext.ts` - Database formatting utilities
3. `app/api/utils/retrieveRelevantData.ts` - Main orchestration
4. `app/api/utils/embeddingSync.ts` - Embedding lifecycle management
5. `app/api/embeddings/generate/route.ts` - Individual embedding generation endpoint
6. `app/api/embeddings/sync/route.ts` - Bulk embedding sync endpoint

## Files to Modify

1. `app/api/intents/process/route.ts` - Add semantic search before LLM call
2. `app/api/prompts/search-info.ts` - Accept and include dbContext
3. `app/api/prompts/ask-advise.ts` - Accept and include dbContext
4. `app/api/prompts/record-event.ts` - Accept and include dbContext
5. `data/supabaseDataService.ts` - Add embedding generation to CRUD operations
6. `contexts/ContactContext.tsx` - Trigger embedding sync on sign-in
7. `components/TalkToCircle.tsx` - Send local data when offline
8. `utils/talkToCircleHelpers.ts` - Accept and pass localData parameter

