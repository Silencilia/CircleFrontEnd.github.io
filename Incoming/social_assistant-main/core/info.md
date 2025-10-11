Available Backend Functions
================================================================================
1. Basic CRUD Operations

Add interaction: User inputs natural language text about meeting someone, backend extracts all structured information automatically
View person timeline: Retrieve all interactions with a specific person in chronological order
Delete records: Remove single interaction or all records for a person
Update information: Add additional information about existing person
================================================================================
2. AI-Powered Extraction
When user inputs text, the system automatically extracts:

Facts: Explicitly stated information with confidence scores (0.0-1.0)
People mentioned: Other people referenced in the conversation with context
Commitments: Promises made, by whom, and deadlines if mentioned
Inferences: AI-deduced information based on context
Topics: Main subjects discussed
================================================================================
3. Relationship Network

Shadow entities: When person A mentions person B who isn't in system yet, backend remembers. When B is added later, system alerts "B was previously mentioned by A"
Connection discovery: Query who knows whom in your network
Relationship paths: Find indirect connections between people
================================================================================
4. Search Capabilities

Semantic search: Search "investor" finds all VCs even if that exact word was never used
Full-text search: Search across all conversation records
Relationship search: Find who is connected to a specific person
Context-aware results: Search results include relevance scores and context snippets
================================================================================
5. Intelligence Features

Commitment tracking: List all pending commitments with deadlines
Relationship maintenance: Identify people not contacted in 30+ days, ranked by relationship importance
Meeting preparation: Generate comprehensive briefing for upcoming meetings including facts, commitments, network connections, and conversation suggestions
Duplicate detection: When adding new person, system checks if they were previously mentioned
================================================================================
6. Data Structure
Each interaction record contains:
json{
  "person_name": "string",
  "timestamp": "datetime",
  "raw_input": "original user text",
  "extracted_data": {
    "facts": [...],
    "people_mentioned": [...],
    "commitments": [...],
    "topics": [...]
  },
  "event_type": "interaction|update"
}
================================================================================
7. API-like Operations Available
# Basic operations
addInteraction(name, text) -> returns extracted data
getPerson(name) -> returns all interactions
deletePerson(name) -> removes all data
searchSemantic(query) -> returns relevant interactions
getConnections(name) -> returns relationship network

# Intelligence operations  
getReminders() -> returns commitments & people to reconnect
prepMeeting(name) -> returns comprehensive briefing
searchRelationships(query) -> returns who knows whom

# Real-time capabilities
extractInformation(text) -> returns structured data immediately
checkShadowEntities(name) -> returns previous mentions

================================================================================