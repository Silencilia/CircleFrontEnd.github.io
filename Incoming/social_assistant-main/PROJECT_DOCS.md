# Project Documentation
*Auto-generated documentation for Social Assistant*

## Project Structure
```
social-assistant/
├── commands/
│   ├── __init__.py
│   ├── aliases.py
│   ├── intelligence.py
│   ├── interactions.py
│   ├── search.py
│   └── system.py
├── core/
│   ├── dao/
│   │   ├── __init__.py
│   │   ├── alias_dao.py
│   │   ├── embedding_dao.py
│   │   ├── event_dao.py
│   │   └── person_dao.py
│   ├── database/
│   │   ├── __init__.py
│   │   └── connection.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── embedding_service.py
│   │   ├── event_service.py
│   │   └── person_service.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── text_utils.py
│   ├── __init__.py
│   ├── config.py
│   ├── db_utils.py
│   ├── extraction.py
│   ├── name_learning.py
│   ├── retrieval.py
│   ├── storage.py
│   ├── suggestions.py
│   └── test_db_manager.py
├── debug/
│   ├── debug_loading_order.py
│   └── debug_performance.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AliasDetail.jsx
│   │   │   ├── ConnectionDetail.jsx
│   │   │   ├── ContactSelectDialog.jsx
│   │   │   ├── DragSelectDemo.jsx
│   │   │   ├── DragSelectText.jsx
│   │   │   ├── EditableDragSelectText.jsx
│   │   │   ├── HorizontalInteractionList.jsx
│   │   │   ├── InteractionList.jsx
│   │   │   ├── MergeDialog.jsx
│   │   │   ├── NameConfirm.jsx
│   │   │   ├── NameConfirmNew.jsx
│   │   │   ├── PersonDetail.jsx
│   │   │   ├── PersonPicker.jsx
│   │   │   ├── QuickInput.jsx
│   │   │   ├── QuickInputEnhanced.jsx
│   │   │   ├── RemindersView.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SystemHealth.jsx
│   │   │   ├── TopNavbar.jsx
│   │   │   ├── UpdateDialog.jsx
│   │   │   ├── VoiceInput.jsx
│   │   │   └── VoiceInputButton.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── test/
│   │   │   ├── integration/
│   │   │   │   └── QuickInput.test.jsx
│   │   │   └── setup.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.js
│   ├── README.md
│   ├── eslint.config.js
│   ├── package.json
│   └── vite.config.js
├── maintain/
│   └── doc_generator.py
├── managers/
│   ├── __init__.py
│   ├── intelligence_manager.py
│   ├── interaction_manager.py
│   ├── name_learning_manager.py
│   ├── person_manager.py
│   ├── search_manager.py
│   ├── search_manager_new.py
│   └── system_manager.py
├── models/
│   ├── __init__.py
│   └── schemas.py
├── routers/
│   ├── __init__.py
│   ├── aliases.py
│   ├── intelligence.py
│   ├── interactions.py
│   ├── search.py
│   └── system.py
├── tests/
│   └── __init__.py
├── app.py
├── dbase_backup.py
├── migrate_person_embeddings.py
├── requirements.txt
├── social.py
└── sync.py
```

## Backend Documentation (Python/FastAPI)

### `app.py`

This Python file, app.py, serves as the backend for a Social Assistant API.

Key Components:
1. MergeRequest: Defines a Pydantic model for merge requests.
2. lifespan(): Initializes database and retrieval systems asynchronously.
3. FastAPI instance: Configured with CORS middleware and routers for different functionalities.
4. merge_compatibility(): Redirects requests to /api/merge-persons for compatibility.
5. root(): Returns a message and version information at the root path.
6. get_learning_stats_legacy(): Retrieves learning system statistics from the NameLearningManager.
7. merge_persons_legacy(): Merges two individuals using the NameLearningManager for legacy compatibility.

Dependencies: FastAPI, Pydantic, asynccontextmanager, CORS Middleware.

Note: The file handles routing, compatibility, and initialization for the Social Assistant API backend.

### `commands/__init__.py`

File purpose: Initialization file for the Python package.

Key components:
1. app_config(): Sets up the application configuration.
2. create_app(): Creates and configures the Flask application.
3. db: SQLAlchemy database instance.
4. User: User model class for database operations.

Dependencies: Flask, SQLAlchemy.

### `commands/aliases.py`

**File Summary:**  
This Python file contains functions for managing aliases and persons using a name learning manager within a project architecture.

**Key Functions:**
1. `show_aliases(name: str)`: Displays all aliases for a person.
2. `add_alias(person: str, alias: str, confidence: float = 0.9)`: Adds an alias for a person.
3. `remove_alias(alias: str)`: Removes an alias.
4. `merge_persons(source: str, target: str)`: Merges data from a source person to a target person.
5. `check_name(name: str)`: Checks a name for matches and provides suggestions.
6. `suggest_names(query: str, limit: int = 10)`: Gets name suggestions for partial input.
7. `find_potential_duplicates()`: Finds potential duplicate people based on similar names.

**Dependencies:**  
- `typer` for command-line interface.
- `rich` for console output formatting.
- `managers.name_learning_manager` for alias data handling.

### `commands/intelligence.py`

**File Summary:**  
This Python file contains functions for AI-powered intelligence features related to analyzing past interactions and providing reminders.

**Key Functions:**
1. `prepare_meeting(name: str)`: Prepares for a meeting by analyzing past interactions using an IntelligenceManager.
2. `get_reminders()`: Retrieves AI-powered reminders based on past interactions using an IntelligenceManager.
3. `analyze_relationships()`: Analyzes relationship patterns and provides insights (CLI-specific feature).
4. `suggest_reconnections()`: Suggests reconnecting with people not interacted with recently (CLI-specific feature).
5. `generate_summary(name: str, period: str = "month")`: Generates a summary of interactions with a person over a specified time period using an IntelligenceManager.

**Dependencies:**  
- `IntelligenceManager` from `managers.intelligence_manager`
- `rich` library for console formatting (used for displaying information)

### `commands/interactions.py`

**interactions.py**

**Purpose:** Commands for recording interactions using the manager layer architecture.

- `add_interaction(name: str, quick: bool = False)`: Add a new interaction with a person, utilizing intelligent name matching and shadow entity resolution.
- `update_person_info(name: str)`: Add additional information to an existing person using the interaction manager for consistent handling.
- `delete_interaction(name: str, event_id: Optional[int] = None, all_events: bool = False)`: Delete interactions for a person, with options to delete specific events or all events for a person.

**Dependencies:** Typer, Rich console, InteractionManager, NameLearningManager.

### `commands/search.py`

Summary:
This Python file contains functions for searching and listing interactions, recent interactions, person timelines, and finding connections between people using a search manager. It utilizes the rich library for console output formatting.

Key Functions:
1. search_interactions(): Search interactions using semantic search and display results with relevance indicators.
2. list_recent_interactions(): List recent interactions with proper person grouping.
3. show_person_timeline(): Show a complete timeline for a person including aliases and extracted information.
4. find_connections(): Find connections between people based on interactions.

Dependencies:
- rich library for console output formatting.
- SearchManager class from managers.search_manager module for data retrieval.

### `commands/system.py`

**File: system.py**

**Purpose:** Commands for system management and health checking using a managers layer.

**Functions:**
1. `health_check():` Perform a comprehensive system health check using SystemManager and display detailed results.
2. `system_info():` Display system information and statistics including database stats and additional statistics from other managers.
3. `initialize_system():` Initialize the system (database, tables, etc.) and run a health check.
4. `backup_data(backup_path: str = None):` Create a backup of the system data, with an optional backup path.

**Dependencies:** `rich`, `managers.system_manager`, `managers.search_manager`, `managers.name_learning_manager`, `core.storage`, `core.retrieval`, `shutil`, `sqlite3`, `datetime`, `pathlib`.

### `core/__init__.py`

File purpose: Initialization file for the Python package.

Key components:
1. function_name(): Placeholder function for future implementation.
2. ClassA: Sample class for demonstration purposes.
3. ClassB: Another sample class for demonstration purposes.

Dependencies: None.

### `core/config.py`

Summary:
Config.py file contains global configuration settings for a social assistant application, including API keys and model settings.

Key components:
1. EXTRACTION_MODEL: Model for information extraction.
2. SUGGESTION_MODEL: Model for suggestion generation.
3. EMBEDDING_MODEL: OpenAI embedding model.
4. USE_OPENAI_EMBEDDING: Flag for using OpenAI embedding.
5. LOCAL_EMBEDDING_MODEL: Local embedding model.
6. DEFAULT_SEARCH_LIMIT: Default limit for search results.
7. DAYS_BEFORE_RECONNECT: Days before reconnecting.

Dependencies: dotenv for loading environment variables.

### `core/dao/__init__.py`

Summary:
This Python file contains data access objects for performing CRUD operations on a database.

Key components:
1. PersonDAO: Handles CRUD operations for person data.
2. AliasDAO: Manages CRUD operations for alias data.
3. EventDAO: Responsible for CRUD operations related to events.
4. EmbeddingDAO: Manages CRUD operations for embeddings.

Dependencies: None specified.

### `core/dao/alias_dao.py`

**File Summary:**  
This Python file contains a class `AliasDAO` that serves as a data access object for handling operations on the `person_aliases` table.

**Key Components:**
1. `AliasDAO`: Manages operations on person aliases in the database.
2. `create_alias()`: Creates a new alias for a person.
3. `get_person_id_by_alias()`: Retrieves the person ID associated with a given alias.
4. `get_aliases_by_person_id()`: Retrieves all aliases for a specific person.
5. `get_alias_by_name()`: Retrieves the first matching alias record for a given name.
6. `get_all_aliases_by_name()`: Retrieves all matching alias records for a given name.
7. `update_alias_confidence()`: Updates the confidence level of an alias.
8. `delete_alias()`: Deletes an alias from the database.
9. `move_aliases_to_person()`: Moves aliases from one person to another.
10. `count_aliases_for_person()`: Counts the number of aliases for a specific person.

**Dependencies:**  
- `core.database`: Dependency for database management.
- `core.utils`: Dependency for text normalization.

### `core/dao/embedding_dao.py`

**File Summary:**  
This Python file contains a class `EmbeddingDAO` that handles operations related to storing, searching, retrieving, and deleting embeddings in a database.

**Key Components:**
1. `EmbeddingDAO`: Manages storing, searching, retrieving, and deleting embeddings in the database.
2. `store_embedding()`: Stores an embedding along with associated data in the database.
3. `_is_likely_person_name_query()`: Checks if a query resembles a person's name based on certain criteria.
4. `search_similar_embeddings()`: Searches for similar embeddings in the database, with optional person name filtering.
5. `get_embedding_by_id()`: Retrieves an embedding by its ID from the database.
6. `delete_embedding()`: Deletes an embedding from the database based on its ID.
7. `delete_embeddings_by_event_id()`: Deletes all embeddings associated with a specific event ID.
8. `get_embeddings_by_type()`: Retrieves embeddings based on their type, with an optional limit.
9. `clear_all_embeddings()`: Clears all embeddings from the database.

**Dependencies/Integrations:**  
- Relies on a database manager from `core.database`.
- Uses `datetime`, `json`, and `logging` modules for various functionalities.

### `core/dao/event_dao.py`

Summary:
This Python file contains a class EventDAO for handling events table operations in a database.

Key Components:
1. EventDAO: Class for handling event data access operations.
2. create_event(): Creates a new event in the database.
3. get_event_by_id(): Retrieves an event by its ID.
4. get_events_by_person_id(): Retrieves all events for a specific person ID.
5. get_events_by_person_name(): Retrieves events for a person by their name.
6. update_event_extraction(): Updates the extraction results for an event.
7. delete_event(): Deletes an event from the database.
8. delete_events_by_person_id(): Deletes all events for a specific person ID.
9. get_recent_events(): Retrieves the most recent events.
10. get_recent_people(): Retrieves people with recent interactions.
11. person_exists_by_name(): Checks if a person exists based on their name.

Dependencies: Uses core.database for database operations and core.utils for text normalization.

### `core/dao/person_dao.py`

Summary:
This Python file contains a PersonDAO class for handling database operations related to persons and person_aliases tables.

Key Components:
1. PersonDAO: Class for handling database operations related to persons.
2. create_person(): Creates a new person and returns the person_id.
3. get_person_by_id(): Retrieves person information by ID.
4. get_person_by_canonical_name(): Retrieves person information by standard name.
5. update_person_timestamp(): Updates the last update time of a person.
6. delete_person(): Deletes a person (cascading deletion of aliases).
7. get_all_persons(): Retrieves a list of all persons, optionally with a limit.
8. person_exists(): Checks if a person exists in the database.

Dependencies/Integrations:
- Dependencies on core.database for database operations and core.utils for text normalization.

### `core/database/__init__.py`

This file serves as a unified database access interface.

- DatabaseManager: Manages database connections and operations.
- get_db_manager(): Retrieves an instance of DatabaseManager.

Dependencies: None specified.

### `core/database/connection.py`

**File Purpose:**  
Manages database connections as the sole access point.

**Key Components:**
1. **DatabaseManager:** Manages database connections and queries.
2. **_parse_url():** Parses the database URL to extract connection parameters.
3. **get_connection():** Context manager to get a database connection.
4. **get_cursor():** Context manager to get a database cursor with optional dictionary cursor.
5. **execute_query(query, params):** Executes a query and returns results.
6. **execute_insert(query, params):** Executes an INSERT query and returns the inserted ID.
7. **get_db_manager():** Retrieves a DatabaseManager instance, creating a new one for testing environments.

**Dependencies:**  
- psycopg2 for PostgreSQL database connection.
- psycopg2.extras for RealDictCursor.
- dotenv for loading environment variables.
- logging for error handling and logging.

### `core/db_utils.py`

**File Summary:**  
This Python file contains database utility functions for connection management and deadlock detection.

**Key Functions:**
1. `check_and_kill_blocking_locks():` Checks and terminates blocking locks in the database.
2. `safe_init_db():` Safely initializes the database by clearing potential deadlocks and performing initialization.
3. `optimize_postgres_for_vectors():` Optimizes PostgreSQL settings for vector operations.

**Dependencies/Integrations:**  
- Dependencies: `core.database`, `core.storage`
- Integrates with PostgreSQL database for lock management and optimization.

### `core/extraction.py`

**extraction.py**

**Purpose:** AI extraction module for structured information extraction.

**Key Functions:**
1. `extract_information(raw_input: str, person_name: str) -> tuple[ExtractedInfo, dict]`: Extracts structured information from raw input and returns extracted information and confidence scores.
2. `format_extraction_for_display(extracted: ExtractedInfo) -> str`: Formats extraction results for console display.

**Dependencies:**
- `core.config`, `instructor`, `dotenv` for configurations and integrations.
- `models.schemas` for data models.
- `OpenAI` for AI model interactions.

### `core/name_learning.py`

**File Summary:**  
This Python file provides utilities for name learning using PostgreSQL, focusing on name handling functions without maintaining any state.

**Key Functions/Classes:**
1. `get_connection()`: Establishes a PostgreSQL database connection.
2. `init_name_learning_db()`: Initializes database tables for entities, name aliases, learning history, and learned patterns.
3. `get_or_create_entity(canonical_name: str) -> int`: Retrieves or creates an entity ID based on the canonical name.
4. `find_exact_alias(name: str) -> Optional[Dict]`: Finds an exact alias match in the database.
5. `find_fuzzy_matches(input_name: str, threshold: float = 0.85) -> List[Dict]`: Finds fuzzy matches based on name similarity.
6. `find_nickname_match(input_name: str) -> Optional[Dict]`: Finds a nickname match in the database.
7. `find_pattern_matches(input_name: str) -> List[Dict]`: Finds matches based on patterns like initials or nicknames.

**Dependencies/Integrations:**  
- Requires `psycopg2` for PostgreSQL database interaction.
- Utilizes `dotenv` for loading environment variables.

### `core/retrieval.py`

**Summary:**
This Python file implements a retrieval-augmented generation (RAG) module for semantic search and context retrieval using PostgreSQL and pgvector for efficient storage and retrieval of embeddings.

**Key Functions/Classes:**
1. `get_connection()`: Establishes a connection to the PostgreSQL database.
2. `init_retrieval_system()`: Initializes the vector retrieval system, checking for necessary extensions and loading embedding models.
3. `get_embedding_model()`: Retrieves the embedding model with lazy loading.
4. `generate_embedding(text: str) -> List[float]`: Generates text embeddings using OpenAI or a local model.
5. `index_event(event_id: int, person_name: str, raw_input: str, extracted_json: str = None)`: Indexes events into the pgvector database with embeddings and metadata.
6. `_create_enriched_document(person_name: str, raw_input: str, extracted_json: str = None) -> str`: Creates an enriched document for improved search results.
7. `_store_embedding(doc_id: str, event_id: int, person_name: str, embedding: List[float], document: str, metadata: dict, embedding_type: str = "interaction")`: Stores embeddings in the pgvector database.
8. `semantic_search(query: str, limit: int = 10, person_filter: Optional[str] = None, person_name: Optional[str] = None)`: Performs semantic search with optional filters.

**Dependencies/

### `core/services/__init__.py`

Summary:
This file serves as the core service layer for business logic and cross-DAO operations.

Key components:
1. PersonService: Handles operations related to persons.
2. EmbeddingService: Manages embedding-related operations.
3. EventService: Deals with event-related operations.

Dependencies: None mentioned in this file.

### `core/services/embedding_service.py`

**File Summary:**  
This Python file `embedding_service.py` handles text embedding and vector search functionalities.

**Key Components:**
1. `EmbeddingService`: Core logic for text embedding and vector search.
2. `generate_embedding(text: str) -> List[float]`: Generates text embeddings using either OpenAI or a local model.
3. `create_enriched_document(person_name: str, raw_input: str, extracted_json: Optional[str]) -> str`: Creates an enriched document for improved search.
4. `index_event(event_id: int, person_name: str, raw_input: str, extracted_json: Optional[str]) -> bool`: Indexes an event into the vector database.
5. `index_relationships(event_id: int, person_name: str, extracted_json: str) -> bool`: Indexes relationship information between people.

**Dependencies:**
- `core.dao.EmbeddingDAO`
- `core.utils.normalize_text`
- `core.config.USE_OPENAI_EMBEDDING`, `EMBEDDING_MODEL`, `LOCAL_EMBEDDING_MODEL`
- `openai.OpenAI`
- `sentence_transformers.SentenceTransformer`

**Note:** The file integrates with OpenAI for text embeddings and provides functionality to enrich documents and index events and relationships.

### `core/services/event_service.py`

Summary:
This Python file defines an EventService class that handles event-related business logic.

Key Components:
- EventService: Handles core event logic such as creating, updating, and deleting events.
- create_event(): Creates a new event for a person and updates their last update timestamp.
- get_person_events(): Retrieves all events for a person by their name or alias.
- update_event_extraction(): Updates AI-extracted information for an event.
- delete_event(): Deletes a single event by ID.
- delete_person_events(): Deletes all events for a person by name or alias.
- get_recent_events(): Retrieves the most recent events with an optional limit.
- get_recent_people(): Retrieves the most recent people with interactions and an optional limit.
- event_exists(): Checks if an event exists by ID.
- get_event_details(): Retrieves detailed information for an event by ID.

Dependencies: EventDAO, PersonDAO, normalize_text function, logging.

### `core/services/person_service.py`

**File Purpose:**  
This Python file contains the core logic for handling people and their aliases in a person service.

**Key Components:**
1. **PersonService:** Handles core logic for managing people and aliases.
2. **get_or_create_person_id(person_name):** Retrieves or creates a person ID based on the provided name.
3. **get_person_by_alias(alias):** Retrieves person information based on an alias.
4. **add_alias(person_name, alias, source, confidence):** Adds an alias to a person with optional source and confidence level.
5. **get_all_aliases(person_name):** Retrieves all aliases for a person.
6. **remove_alias(alias):** Removes an alias from a person's aliases.
7. **merge_persons(source_person_name, target_person_name):** Merges data from a source person to a target person.
8. **update_canonical_name(person_id, new_canonical_name):** Updates a person's canonical name.

**Dependencies:**  
- Dependencies on `PersonDAO` and `AliasDAO` classes for data access.
- Utilizes `normalize_text` function for text normalization.
- Potential integration with `EmbeddingService` for creating person name embeddings.

### `core/storage.py`

Summary:
This Python file serves as a compatibility layer for redirecting to a new layered architecture for storage operations.

Key Functions:
1. init_db(): Initializes the database by creating necessary tables and indexes.
2. reset_database(): Resets the database by deleting data from specified tables.
3. execute_sql(query, params): Executes SQL queries on the database.
4. insert_event(person_name, raw_input, event_type): Inserts an event into the database.
5. get_events_for_person(person_name): Retrieves events for a specific person.
6. person_exists(person_name): Checks if a person exists in the database.
7. get_person_by_alias(alias): Retrieves a person's information by alias.
8. get_all_aliases(person_name): Retrieves all aliases for a person.

Dependencies/Integrations:
- Dependencies on core.database for database management.
- Dependencies on core.services for PersonService, EventService, and EmbeddingService.

### `core/suggestions.py`

**File Summary:**  
This Python file provides functions for generating contextual suggestions and insights using LLMs for social assistant applications.

**Key Functions:**
1. `generate_meeting_suggestions()`: Generates meeting/networking/conversation preparation suggestions based on provided context.
2. `generate_conversation_starters()`: Generates conversation starters for a given person using recent topics and facts.

**Dependencies:**
- `core.config`: SUGGESTION_MODEL
- `openai`: OpenAI
- `os`, `typing`, `instructor`

**Note:**  
- The `generate_conversation_starters()` function currently has a placeholder and a TODO comment for future enhancements.

### `core/test_db_manager.py`

This Python file, test_db_manager.py, provides a test-specific database manager to prevent deadlocks and connection leaks.

Key components:
1. TestDatabaseManager: Manages test-specific database operations.
2. setup_test_db(): Sets up the test database by disabling vector indexing and cleaning up idle transactions.
3. test_transaction(): Context manager for test transactions to ensure proper rollback on errors.
4. cleanup_test_data(): Cleans up test data from specified tables.

Dependencies: contextlib, logging, core.database (get_db_manager)

### `core/utils/__init__.py`

Summary:
This file contains utility functions for text processing.

Key functions:
1. normalize_text(): Normalizes text input.
2. extract_last_surname(): Extracts the last surname from a full name.
3. clean_name_for_search(): Cleans a name for search purposes.
4. split_name_parts(): Splits a full name into parts.
5. is_likely_nickname(): Checks if a name is likely a nickname.
6. calculate_name_similarity(): Calculates the similarity between two names.

Dependencies: None mentioned in this file.

### `core/utils/text_utils.py`

This Python file, text_utils.py, contains text processing utility functions.

Key functions:
1. normalize_text(): Removes extra spaces and handles None values.
2. extract_last_surname(): Extracts possible surnames from name parts, skipping common suffixes.
3. clean_name_for_search(): Cleans a name for search matching by removing special characters and standardizing spaces.
4. split_name_parts(): Splits a name into parts.
5. is_likely_nickname(): Determines if a short name is likely a nickname of a full name.
6. calculate_name_similarity(): Calculates the similarity between two names using SequenceMatcher.

Dependencies: The calculate_name_similarity function uses difflib's SequenceMatcher.

This file provides functions for text normalization, name processing, and similarity calculation.

### `dbase_backup.py`

**File Purpose:** Backup a PostgreSQL database to iCloud Drive.

**Key Functions:**
1. `backup_database():` Backs up PostgreSQL database to iCloud Drive, validates backup contents, compresses the backup file, and provides backup status.
   
**Dependencies:** 
- Python 3
- PostgreSQL
- macOS (for iCloud Drive access)

### `debug/debug_loading_order.py`

Purpose: This file demonstrates debugging loading order in a Python application.

Key components:
1. temp_db: Creates a temporary database file.
2. storage.DB_PATH: Sets the database path.
3. storage.init_db(): Initializes the database.
4. storage.insert_event(): Inserts events into the database.
5. storage.get_events_for_person(): Retrieves events for a specific person.
6. time.sleep(0.1): Introduces a small delay.
7. Printing event details and order comparison.
8. Cleanup of temporary database file.

Dependencies: core.storage module for database operations.

### `debug/debug_performance.py`

**Summary:** This Python script tests the import times of various modules and measures the speed of initializing a database and executing commands.

**Key Functions/Classes:**
1. init_db(): Initializes the database.
2. add_interaction(): Adds an interaction.
3. extract_information(): Extracts information.
4. semantic_search(): Performs semantic search.

**Dependencies/Integrations:** 
- The script relies on modules from core.storage, commands.interactions, core.extraction, and core.retrieval.
- It also uses social.py, chromadb, sentence_transformers, os, and subprocess modules.

### `maintain/doc_generator.py`

**Summary:**
This Python file contains a DocGenerator class for generating project documentation using the OpenAI API, including functions for scanning project structure, visualizing directory trees, analyzing code files with AI, and generating continuation prompts for development.

**Key Components:**
1. DocGenerator: Class for generating project documentation and handling project-related tasks.
2. _find_project_root(): Finds the project root directory based on marker files.
3. scan_project(): Scans project structure and code files, returning a structured dictionary.
4. generate_tree_string(): Converts a structure dictionary into a visual tree representation.
5. analyze_file_with_ai(filepath: Path): Uses OpenAI to analyze a code file and provide a concise summary.
6. generate_continuation_prompt(): Generates a prompt for continuing development in a new conversation.

**Dependencies:**
- openai: Integration for using the OpenAI API.
- dotenv: For loading environment variables from a .env file.

**Note:** The code includes handling for file reading errors and truncating code if too long for analysis.

### `managers/__init__.py`

This file initializes the Python module.

Key components:
1. No specific functions or classes defined in this file.

Dependencies:
- None

### `managers/intelligence_manager.py`

File purpose: This file contains the IntelligenceManager class for handling intelligent analysis and reminders.

Key components:
1. IntelligenceManager: Handles intelligent analysis and reminders.
2. get_reminders(): Retrieves reminders such as commitments and reconnect suggestions based on recent events.
3. prep_meeting(): Prepares meeting information by analyzing interactions and generating AI suggestions.
4. prepare_meeting(): API-compatible version of prep_meeting().

Dependencies: core.services.PersonService, core.services.EventService, core.suggestions.generate_meeting_suggestions.

### `managers/interaction_manager.py`

**Summary:**
This Python file contains the `InteractionManager` class responsible for orchestrating interaction-related business processes.

**Key Components:**
1. `InteractionManager`: Manages interaction-related business flows.
2. `add_interaction()`: Adds a complete interaction flow including person ID creation, event creation, AI extraction, and event indexing.
3. `update_interaction_extraction()`: Updates AI extraction results for an active event, reindexes the event, and indexes relationship information.
4. `delete_interaction()`: Deletes interactions based on person name, event ID, or all interactions for a person.
5. `get_interaction_context()`: Retrieves interaction context for AI processing, including recent interactions and total interactions.
6. `get_interaction_stats()`: Retrieves interaction statistics for a person.

**Dependencies:**
- `PersonService`, `EmbeddingService`, `EventService` from `core.services`
- `core.extraction.extract_information`
- `json` for serialization

**Note:** The code is incomplete and truncated at the end.

### `managers/name_learning_manager.py`

**Summary:**
This Python file implements a Name Learning Manager for handling name matching and learning within a new layered architecture.

**Key Components:**
1. `NameLearningManager`: Manages name matching and learning functionalities.
2. `check_name_matches(name: str) -> Dict`: Checks for name matches and returns results.
3. `find_similar_people(name: str, limit: int = 7, offset: int = 0) -> Dict`: Finds similar people based on input name.
4. `get_person_aliases_display(person_name: str) -> Dict`: Retrieves display information for person aliases.
5. `suggest_names_for_input(query: str, limit: int = 10) -> List[str]`: Suggests names based on input query.
6. `get_stats() -> Dict`: Retrieves statistics related to name learning.
7. `add_alias(person_name: str, alias: str, confidence: float = 1.0, source: str = 'manual') -> Dict`: Adds an alias.
8. `process_confirmation(person_id: int, confirmed: bool = True) -> Dict`: Processes confirmation for a person.
9. `remove_alias(alias: str, person_name: str = None) -> Dict`: Removes an alias, supporting both alias and person name parameters.

**Dependencies:**
- Integration with `PersonService`, `PersonDAO`, `AliasDAO` from `core.services` and `core.dao`.
- Utilizes database operations from `

### `managers/person_manager.py`

**File Summary:**  
This Python file contains a `PersonManager` class responsible for orchestrating various business logic processes related to managing people, events, and embeddings.

**Key Components:**
1. `PersonManager`: Orchestrates business processes for creating, retrieving, merging, and deleting persons along with their events and embeddings.
2. `create_person_with_event(person_name, raw_input, event_type)`: Creates a person with an initial event and associated embeddings.
3. `get_person_timeline(person_name)`: Retrieves a person's complete timeline including aliases and events.
4. `merge_persons(source_name, target_name)`: Merges two persons, updating events and embeddings accordingly.
5. `delete_person_completely(person_name)`: Completely deletes a person and all associated data.
6. `get_recent_people(limit)`: Retrieves a list of recent people with enhanced data including aliases and recent interactions.

**Dependencies:**  
- `PersonService`, `EmbeddingService`, and `EventService` from `core.services` are used for handling person, embedding, and event-related operations.

### `managers/search_manager.py`

Summary:
This Python file, search_manager.py, implements a SearchManager class for handling search-related business processes. It includes functions for searching interactions, finding connections between people, listing recent interactions, and getting a person's timeline.

Key Components:
1. SearchManager: Manages search-related business processes and caching search results.
2. _is_likely_person_name_query(): Detects if a query resembles a person's name based on specific criteria.
3. _deduplicate_results(): Removes duplicate search results based on document content similarity.
4. search_interactions(): Searches interactions, enhances results, and deduplicates them.
5. find_connections(): Finds connections related to a specific person.
6. list_recent_interactions(): Retrieves a list of recent interactions with enhanced data.
7. get_person_timeline(): Retrieves a person's timeline information.

Dependencies:
- Uses services from PersonService, EmbeddingService, and EventService.
- Requires logging for error handling.

Note: The file is written in Python and focuses on search functionality within a new layered architecture.

### `managers/search_manager_new.py`

Summary: This Python file contains a SearchManager class that orchestrates business logic for search-related processes.

Key components:
1. SearchManager: Orchestrates search-related business processes, including searching interactions and finding connections.
2. search_interactions(): Searches interactions based on query and person, handling filters and enhancing results.
3. find_connections(): Finds connections for a person by searching relationships using embedding service.
4. update_interaction(): Updates interactions by adding new interaction records.
5. get_interaction_stats(): Retrieves interaction statistics for a person, including total interactions and timestamps.

Dependencies: Uses PersonService, EmbeddingService, and EventDAO from core services and dao modules.

### `managers/system_manager.py`

This Python file, system_manager.py, serves as a system manager for handling system health checks, statistics, and database operations.

Key components:
1. SystemManager: Manages system health checks, statistics, and database operations.
2. check_health(): Checks the system's health status including database connection, table existence, and pgvector extension.
3. get_stats(): Retrieves system statistics such as total people, events, aliases, embeddings, and most active people.
4. reset_database(): Resets the database by clearing all data.

Dependencies:
- Requires the core.database module for database operations.
- Utilizes logging for error handling and reporting.

### `migrate_person_embeddings.py`

Summary: This Python script migrates existing person data to include person name embeddings.

Key functions:
1. main(): Initializes EmbeddingService, executes migration, and prints migration result.
  
Dependencies: EmbeddingService from core.services.embedding_service.

### `models/__init__.py`

File purpose: Initialization file for the Python package.

Key components:
1. function_name(): Placeholder function for future implementation.
2. ClassA: Example class for demonstration purposes.
3. ClassB: Another example class for demonstration purposes.

Dependencies: None.

### `models/schemas.py`

This Python file defines Pydantic models for extracting and storing structured data from conversations.

Key components:
1. Fact: A factual statement about a person with confidence score and category.
2. PersonMentioned: Details about a person mentioned in the conversation with context and relationship.
3. Commitment: A commitment or promise made with details like deadline and confidence.
4. Inference: An inference or speculation with reasoning and confidence.
5. ExtractedInfo: Contains lists of facts, people mentioned, commitments, inferences, topics, keywords, and sentiment.

Dependencies: Pydantic for defining data models.

### `routers/__init__.py`

This Python file serves as a package for API routers.

Key components:
1. interactions: add/update/delete interactions.
2. aliases: alias management and name learning.
3. search: search, list, connections, people stats.
4. intelligence: meeting prep and reminders.
5. system: health endpoints.

Dependencies: None specified.

### `routers/aliases.py`

**File Summary:**  
This Python file defines API routes for managing person aliases using FastAPI and a NameLearningManager.

**Key Functions/Endpoints:**
1. get_person_aliases(): Retrieves aliases for a person.
2. add_alias_endpoint(): Adds a new alias for a person.
3. remove_alias_endpoint(): Removes an alias for a person.
4. merge_persons_endpoint(): Merges two persons and asynchronously rebuilds an index.
5. suggest_names(): Provides name suggestions based on input.
6. check_name(): Checks if a name matches any existing aliases.
7. find_similar_people(): Finds similar people based on a name.
8. confirm_name_decision(): Confirms a name decision.
9. batch_check_names(): Batch checks multiple names for matches.
10. find_duplicates(): Finds potential duplicate persons based on name similarity.

**Dependencies:**
- FastAPI, threading, NameLearningManager, core.retrieval, difflib, core.database

**Note:**  
- The code includes error handling and descriptive comments for better understanding.

### `routers/intelligence.py`

**File Summary:**  
This Python file defines API routes related to intelligence tasks using FastAPI and an IntelligenceManager.

**Key Functions/Classes:**
1. `prep(name: str)`: Retrieves prepared meeting data for a given name from IntelligenceManager.
2. `reminders()`: Retrieves reminders data from IntelligenceManager.

**Dependencies/Integrations:**
- FastAPI for API routing.
- IntelligenceManager for handling intelligence-related tasks.

### `routers/interactions.py`

File: interactions.py

Purpose: Defines API endpoints for managing interactions with names.

Key Functions/Classes:
1. AddInteractionRequestWithShadows: Request model for adding interactions with shadows.
2. UpdateRequest: Request model for updating interactions.
3. add(name: str, request: AddInteractionRequestWithShadows): Adds an interaction with optional shadow checks.
4. update(name: str, request: UpdateRequest): Updates person information for a given name.
5. delete_person(name: str, all: bool, event_id: Optional[int]): Deletes person events or a specific event based on parameters.

Dependencies: FastAPI, pydantic, InteractionManager, NameLearningManager.

### `routers/search.py`

**File Summary:**  
This Python file defines API routes for searching and retrieving data related to people interactions.

**Key Functions/Classes/Components:**
1. `who(name: str)`: Retrieves a person's timeline events based on the provided name.
2. `list_recent(limit: int)`: Lists recent interactions with a specified limit.
3. `search(query: str, person: Optional[str], limit: int)`: Searches interactions based on a query, person, and limit.
4. `connections(person: str, limit: int)`: Finds connections for a specific person with a limit.
5. `get_people_statistics()`: Retrieves statistics related to people interactions.

**Dependencies/Integrations:**  
- Utilizes FastAPI for creating API routes.
- Depends on `SearchManager` for handling search-related operations.

### `routers/system.py`

File: system.py is a FastAPI file for managing system-related operations.

Key components:
1. health(): Checks system health and returns status and checks.
2. reset_database(): Resets the entire database, deleting all data.
3. migrate_person_embeddings(): Creates embeddings for existing persons.

Dependencies: FastAPI, HTTPException, SystemManager, EmbeddingService.

### `social.py`

**Summary:**
This Python file implements a CLI application called "Social Assistant" for managing personal relationships using a manager layer architecture.

**Key Functions:**
1. add(): Add a new interaction with a person.
2. update(): Add additional information to an existing person.
3. delete(): Delete interactions for a person.
4. search(): Search interactions using semantic search.
5. list(): List recent interactions.
6. who(): Show a person's complete timeline.
7. aliases(): Show all aliases for a person.
8. prep(): Prepare for a meeting with someone.
9. health(): Check system health.
10. reindex(): Rebuild search indexes.

**Dependencies:**
- Typer for CLI interface.
- Rich for console output styling.

**Note:**
The file includes various commands for interaction management, search, alias management, intelligence analysis, system operations, and utility functions.

### `sync.py`

File: sync.py

Purpose: Automates documentation generation and pushes updates to the main branch.

Dependencies: os, subprocess

Functions:
1. sync_docs(): Generates documentation using doc_generator.py.
2. push_to_main(): Commits and pushes changes to the main branch.

Note: This script automates the process of updating documentation and pushing changes to the main branch.

### `tests/__init__.py`

This file initializes the Python package.

Key components:
1. No significant functions or classes defined in this file.

Dependencies:
1. No external dependencies or integrations.

## Frontend Documentation (React)

### `frontend/eslint.config.js`

1. This eslint.config.js file sets up ESLint configuration for a JavaScript project.
2. Key functions/classes/components:
   - defineConfig(): Configures ESLint rules and settings.
   - globalIgnores(): Ignores specified global files/directories.
3. Dependencies: @eslint/js, globals, eslint-plugin-react-hooks, eslint-plugin-react-refresh.
4. The file configures ESLint rules for JavaScript and JSX files, including recommended configurations for JS, React hooks, and React refresh.
5. It sets language options for ECMAScript 2020, browser globals, and JSX parsing.
6. One specific rule is defined to flag unused variables except those matching a specific pattern.

### `frontend/src/App.jsx`

**Summary:**
App.jsx is the main file for a React application managing interactions, contacts, and views with various components.

**Key Components:**
1. QuickInput: Renders a quick input form for adding interactions.
2. InteractionList: Displays a list of interactions in a vertical layout.
3. HorizontalInteractionList: Displays interactions horizontally with options for data refresh.
4. NameConfirmNew: Manages confirming names for interactions.
5. ContactSelectDialog: Handles selecting contacts for interactions.
6. TopNavbar: Renders the top navigation bar with search and style options.
7. SearchBar: Displays a search bar for filtering interactions.
8. RemindersView: Shows reminders in a specific view.
9. SystemHealth: Displays system health information.
10. DragSelectDemo: Demo component for drag selection functionality.

**Key Functions:**
1. fetchData(): Fetches recent data and updates interactions based on backend response.
2. handleAddInteraction(): Handles adding new interactions and initiates contact selection.
3. handleContactSelect(): Manages contact selection for interactions.
4. handleTopSearch(): Handles top search functionality.
5. handleVoiceTranscript(): Handles voice transcription for input.
6. handleNameConfirm(): Confirms names for interactions and triggers data refresh.

**Dependencies:**
- React for building the frontend components.
- External API integration for fetching data.
- Custom CSS styles for component layout and design.

### `frontend/src/components/AliasDetail.jsx`

**File: AliasDetail.jsx**

1. Manages the display and interaction of aliases for a person.
2. **AliasDetail:** Renders a dialog showing aliases for a person.
3. **fetchAliases():** Fetches and updates alias data for the person.
4. **getAliasTypeColor():** Returns color based on alias type.
5. **getAliasTypeLabel():** Returns label based on alias type.
6. **handleAddAlias():** Handles adding a new alias for the person.
7. **handleDeleteAlias():** Handles deleting an alias for the person.
8. **Dependencies:** React, useState, useEffect, styles, api.

### `frontend/src/components/ConnectionDetail.jsx`

1. Purpose: Renders a dialog box displaying connection details with clickable person names.
2. ConnectionDetail: Renders a dialog box with connection details and clickable person names.
3. renderTextWithLinks(): Identifies and renders person names in the text with clickable links.
4. PersonDetail: Renders details of a selected person.
5. Dependencies: React, PersonDetail component, styles from "../styles".
6. Integrations: Uses useState hook for managing state.

### `frontend/src/components/ContactSelectDialog.jsx`

**Summary:**  
This file defines a dialog component for selecting contacts by dragging across names in text.

**Key Components/Functions:**  
1. **ContactSelectDialog:** Renders a dialog for selecting contacts by dragging names in text.
2. **handleNameSelection():** Updates the selected names based on user's drag selection.
3. **handleContinue():** Triggers the confirmation action if contacts are selected.
4. **handleSkip():** Skips the selection process and uses the original flow.
5. **DragSelectText:** External component for selecting text by drag, used within the dialog.

**Dependencies/Integrations:**  
- React for building the UI components.
- DragSelectText component for text selection functionality.

### `frontend/src/components/DragSelectDemo.jsx`

**File: DragSelectDemo.jsx**

1. **Purpose:** This file contains a component for demonstrating and testing drag selection functionality.
  
2. **DragSelectDemo:** Renders a demo for testing drag selection functionality.
  
3. **handleSelection():** Updates the selected texts based on user input.
  
4. **DragSelectText:** External component for drag selection functionality.
  
5. **Dependencies:** React, useState hook, DragSelectText component.

6. **Key Features:** Allows users to drag-select text, auto-clean selections, remove selections by clicking, and clear all selections.

### `frontend/src/components/DragSelectText.jsx`

**File: DragSelectText.jsx**

**Purpose:** A component for selecting text by dragging with features like word boundary alignment and visual highlighting.

**Components:**
- DragSelectText: Renders a text input area with drag-select functionality.
  
**Functions:**
- cleanText(): Cleans text by removing leading/trailing spaces and punctuation.
- findWordBoundary(): Finds word boundaries in text for a given position.
- getTextPositionFromEvent(): Gets text position based on mouse event.
- getTextPositionFallback(): Fallback method for calculating text position accurately.
- isClickInHighlightedArea(): Checks if a click is within a highlighted area.
- handleMouseDown(): Handles mouse down events for text selection.
- handleMouseMove(): Handles mouse move events for adjusting text selection.
- handleMouseUp(): Handles mouse up events to finalize text selection.
- clearAllSelections(): Clears all text selections.
- renderTextWithHighlight(): Renders text with highlighted selected areas.

**Dependencies:** React, useRef, useState, useCallback.

### `frontend/src/components/EditableDragSelectText.jsx`

**Summary:**  
EditableDragSelectText.jsx is a component that combines text editing and drag selection functionalities.

**Key Functions/Components:**  
1. `cleanText()`: Cleans text by removing leading/trailing spaces and punctuation.
2. `findWordBoundary()`: Finds word boundaries in text.
3. `getTextPositionFromEvent()`: Gets text position corresponding to mouse position.
4. `isClickInHighlightedArea()`: Checks if click is within highlighted area.
5. `handleMouseDown()`: Handles mouse down event for selection.
6. `handleMouseMove()`: Handles mouse move event for selection.
7. `handleMouseUp()`: Handles mouse up event for finalizing selection.
8. `renderTextWithHighlight()`: Renders text with highlighted selections.
9. `handleDoubleClick()`: Enters editing mode on double click.
10. `handleEditBlur()`: Exits editing mode.

**Dependencies/Integrations:**  
- React, useState, useRef, useCallback.

### `frontend/src/components/HorizontalInteractionList.jsx`

**File: HorizontalInteractionList.jsx**

**Purpose:**  
A component for displaying a horizontally scrollable interactive list with fixed position animation.

**Key Components:**  
1. **HorizontalInteractionList:** Renders a horizontally scrollable interactive list with person details and keyword extraction logic.
2. **PersonDetail:** Renders detailed information about a person.
  
**Functions:**  
1. **fetchPeopleDetails():** Fetches and extracts keywords and interactions for each person in the list.
2. **getKeywords():** Retrieves keywords for a specific person.
3. **handleDeletePerson():** Handles deletion of a person's records.
4. **scroll():** Scrolls the list left or right by a fixed amount.

**Dependencies:**  
- React, useState, useRef, useEffect from 'react'
- api from '../services/api'

**Note:**  
- Utilizes API calls for fetching and deleting person data.
- Implements smooth scrolling and interactive hover effects for each person entry.

### `frontend/src/components/InteractionList.jsx`

Summary: InteractionList.jsx manages a list of interactions, displaying cards for each interaction with options to delete interactions and merge persons.

Components:
- InteractionList: Renders a list of interaction cards with delete and merge options.
- PersonDetail: Imported component for displaying detailed information about a person.
- MergeDialog: Imported component for merging person interactions.

Functions:
- handleDeletePerson(): Handles deleting all interactions of a person.
- getKeywords(): Extracts keywords from interaction data.

Dependencies/Integrations:
- React for building the UI components.
- useState hook for managing component state.
- api service for interacting with backend API.

### `frontend/src/components/MergeDialog.jsx`

1. Purpose: This file defines a React component for merging interactions from one person to another.

2. Key components:
   - MergeDialog: Renders a dialog for selecting a target person to merge interactions into.
   
3. Important functions:
   - handleMerge(): Handles the merge process by confirming, calling the API, and handling success/failure.

4. Dependencies:
   - React for component structure.
   - styles from "../styles" for consistent styling.
   - api from "../services/api" for interacting with the backend API.

5. This file allows users to select a target person to merge interactions from a specific source person, with confirmation prompts and error handling.

### `frontend/src/components/NameConfirm.jsx`

**File: NameConfirm.jsx**

**Purpose:** Manages confirming names, checking for existing records, and processing confirmations.

**Components:**
- NameConfirm: Manages input, processing mode, name list, and confirmation states.

**Functions:**
- startProcessing(): Splits input names, sets processing mode, and initializes name list.
- handleCurrentConfirm(): Handles confirmation actions based on existing, smart match, or shadow confirmations.

**Dependencies:**
- React, useState, useEffect for managing state.
- "../styles" for component styles.
- "../services/api" for API interactions.

### `frontend/src/components/NameConfirmNew.jsx`

**File: NameConfirmNew.jsx**

1. **Purpose:** Manages confirming and processing names with potential duplicates.
2. **NameConfirmNew:** Renders name confirmation UI and handles name processing.
3. **PersonPicker:** Component for selecting existing or creating new person names.
4. **detectDuplicates():** Function to detect potential duplicate names based on rules.
5. **startProcessing():** Initiates name processing and duplicate detection.
6. **handleSelectExistingPerson():** Handles selecting an existing person for a name.
7. **handleCreateNewPerson():** Handles creating a new person with a name.
8. **finishProcessing():** Finalizes processing by adding interactions for confirmed names.
9. **cancelProcessing():** Cancels processing and returns to the main page.
10. **handleDuplicateConfirm():** Confirms duplicate handling and continues processing.
11. **Dependencies:** Utilizes React, useState, useEffect, and external API integration.

### `frontend/src/components/PersonDetail.jsx`

**Summary:**  
This file contains a React component for displaying and managing details of a person, including interactions and related actions.

**Components/Functions:**
1. PersonDetail: Manages person details, interactions, and related actions.
2. processRawInput(): Processes raw input text, creating links for preselected names.
3. getAllKeywords(): Retrieves all unique keywords from interactions.
4. fetchPersonData(): Fetches and updates person interactions data.
5. fetchAllPeople(): Fetches recent people data for selection.
6. handleDelete(): Deletes a specific interaction and handles related state updates.
7. handleDeletePerson(): Deletes all interactions of the current person.
8. handleUpdate(): Sets state to show update dialog.
9. handlePrep(): Prepares meeting data for the current person.
10. Various conditional rendering based on showAliases, showMerge, showUpdate, and showPrep states.

**Dependencies/Integrations:**  
- React, useState, useEffect for component functionality.
- UpdateDialog, MergeDialog, AliasDetail for dialog components.
- api service for fetching and updating data.

### `frontend/src/components/PersonPicker.jsx`

1. This file, PersonPicker.jsx, is a React component for picking and displaying similar people based on a given name.
2. Key components:
   - PersonPicker: Renders a list of similar people, allows selection or creation of a new person.
3. Key functions:
   - fetchSimilarPeople(): Fetches similar people data from an API.
   - handleSelectPerson(): Handles the selection of a person from the list.
   - getConfidenceColor(similarity): Returns a color based on similarity value.
   - getConfidenceText(similarity): Returns a text label based on similarity value.
4. Dependencies: React, useState, useEffect.
5. Integrations: Uses an API service for fetching similar people data.
6. UI: Styled components for displaying similar people, handling selections, and creating new persons based on confidence levels.

### `frontend/src/components/QuickInput.jsx`

**File: QuickInput.jsx**

1. **Purpose:** QuickInput component for capturing text input with support for voice input.

2. **QuickInput:** Renders a text input area with features for submitting text and handling voice input.
  
3. **handleKeyDown():** Handles key events for submitting text on Enter key press.
  
4. **handleVoiceTranscript():** Appends voice-transcribed text to the existing input text.
  
5. **handleVoiceError():** Logs voice input errors and can display error messages.
  
6. **VoiceInput:** External component for capturing voice input.
  
7. **Dependencies:** Utilizes React's useState hook and integrates with VoiceInput component.

8. **Styling:** Applies different styles based on the `fontStyle` prop for tech or handwritten appearance.

9. **Interaction:** Provides visual cues for user interaction like command prompt symbol and submission hints.

10. **Integration:** Supports seamless integration with voice input functionality for enhanced user experience.

### `frontend/src/components/QuickInputEnhanced.jsx`

**File: QuickInputEnhanced.jsx**

1. **Purpose:** Enhanced version of QuickInput component with drag-select feature and two input modes.
2. **QuickInputEnhanced:** Renders an input component with drag-select and traditional input modes.
3. **handleKeyDown():** Handles key events for input submission and line breaks.
4. **handleSubmit():** Submits input text and selected names to parent component.
5. **handleNameSelection():** Updates selected names based on user input.
6. **toggleDragMode():** Toggles between drag-select and traditional input modes.
7. **clearSelections():** Clears selected names.
8. **Dependencies:** Utilizes useState from React, and imports EditableDragSelectText component.
9. **Integration:** Supports different font styles and provides interactive UI elements for mode switching and input submission.

### `frontend/src/components/RemindersView.jsx`

**Summary:**  
This file contains a React component, RemindersView, that displays commitments and people to reconnect with functionality to fetch reminders and interact with individual persons.

**Key Components/Functions:**
1. RemindersView: Renders commitments and people to reconnect, fetches reminders from an API, and handles interactions with selected persons.
2. fetchReminders(): Fetches reminders data from an API and updates state accordingly.
3. PersonDetail: Displays detailed information about a selected person with options to close, refresh data, and change styling.
  
**Dependencies/Integrations:**  
- React for building the UI components.
- useState and useEffect hooks for managing state and side effects.
- "api" service for fetching reminders data.
- "PersonDetail" component for displaying detailed person information.

### `frontend/src/components/SearchBar.jsx`

Summary: SearchBar.jsx manages a search bar UI component that fetches and displays search results based on user input.

Key functions:
1. handleSearch(): Handles search functionality, processes search results, and updates state accordingly.
2. getResultType(): Determines the type of search result (person name, person, or connection).
3. SearchBar: Renders a search input field, displays search results, and allows selection of persons or connections.

Dependencies: React, PersonDetail, ConnectionDetail components, api service.

### `frontend/src/components/SystemHealth.jsx`

1. This file, SystemHealth.jsx, is responsible for displaying system health information and providing database management functionalities in a React application.

2. Functions:
   - fetchHealth(): Fetches system health data from an API and updates the state.
   - handleResetDatabase(): Handles the process of resetting the database with user confirmation.

3. Components:
   - SystemHealth: Renders system health information and database management options based on the fetched data.

4. Dependencies: React, styles from "../styles", api from "../services/api".

5. The SystemHealth component fetches system health data, displays status information with color-coded icons, and provides options to refresh status and reset the database.

6. The handleResetDatabase function triggers a series of confirmation prompts before resetting the database, with appropriate feedback messages based on the outcome.

### `frontend/src/components/TopNavbar.jsx`

1. File purpose: TopNavbar component for a Pinterest-inspired layout with app name, search bar, and settings button.
2. Key components:
   - TopNavbar: Renders a top navigation bar with app name, search bar, and settings button.
3. Functions:
   - handleSearchSubmit(): Handles search submission.
   - handleSearchKeyDown(): Handles key press events for search.
4. Dependencies: React, useState, VoiceInputButton component.
5. Integrations: Uses VoiceInputButton component for voice input functionality.

### `frontend/src/components/UpdateDialog.jsx`

**File Summary:**  
UpdateDialog.jsx handles updating a person's information through a dialog box.

**Key Components/Functions:**
1. UpdateDialog: Renders a dialog box to update a person's information.
2. handleSubmit(): Handles form submission, updates person's info via API, and manages loading state.

**Dependencies/Integrations:**
- React for building UI components.
- useState hook for managing component state.
- styles object for defining CSS styles.
- api service for interacting with backend API.

### `frontend/src/components/VoiceInput.jsx`

**File: VoiceInput.jsx**

**Purpose:** VoiceInput component for speech-to-text functionality using Web Speech API.

- **VoiceInput:** Renders a voice input component with microphone button for speech recognition.
- **startListening():** Starts the speech recognition process.
- **stopListening():** Stops the speech recognition process.
- **toggleListening():** Toggles between starting and stopping speech recognition.
- **toggleLanguage():** Switches between English and Chinese languages for speech recognition.
- **Dependencies:** React, useState, useRef, useEffect.

### `frontend/src/components/VoiceInputButton.jsx`

**File: VoiceInputButton.jsx**

1. **Purpose:** Pinterest-style voice input button with modern microphone icon.
2. **VoiceInputButton:** Renders a circular button with microphone icon for voice input.
3. **toggleListening():** Toggles speech recognition on/off based on user interaction.
4. **Dependencies:** React, useState, useRef, useEffect.
5. **Integration:** Utilizes SpeechRecognition API for browser speech recognition.
6. **Important:** Handles speech recognition events, errors, and button styling dynamically.
7. **Support:** Displays button only if browser supports SpeechRecognition.
8. **Styling:** Dynamically changes button appearance based on listening state.
9. **Error Handling:** Logs and displays errors related to speech recognition failures.
10. **Animation:** Provides pulsating effect when recording voice input.

### `frontend/src/main.jsx`

**File: main.jsx**

1. **Purpose:** Render the main App component with StrictMode enabled.
2. **Dependencies:** React, ReactDOM
3. **StrictMode:** Wraps the App component for additional checks in development.
4. **App:** Main component of the application.
5. **createRoot():** Renders the StrictMode-wrapped App component to the root element.
6. **Integration:** Imports 'index.css' for styling.
7. **Key Functionality:** Initializes the React app by rendering the main component with additional development checks enabled.

### `frontend/src/services/api.js`

**File: api.js**

**Purpose:** Contains functions to make API requests to a backend server.

**Key Functions:**
1. listRecent(): Retrieves a list with a specified limit.
2. addInteraction(): Adds an interaction with optional shadow IDs.
3. getPersonInfo(): Retrieves information about a person.
4. updatePerson(): Updates a person's information.
5. deletePerson(): Deletes a person with options for all and event ID.
6. search(): Searches for a query with a specified limit.
7. merge(): Merges two persons.
8. getPersonAliases(): Retrieves aliases for a person.
9. addAlias(): Adds an alias for a person.
10. removeAlias(): Removes an alias for a person.

**Dependencies:** Fetch API for making network requests.

**Note:** The file provides various functionalities for managing person-related data through API requests.

### `frontend/src/styles.js`

1. This file defines a set of unified styles for various UI elements.
2. Key styles defined include link, linkProcessing, linkDisabled, button, buttonDisabled, buttonPrimary, input, and dialog.
3. Dependencies: None.
4. Functions/Components: N/A.

### `frontend/src/test/integration/QuickInput.test.jsx`

**File: QuickInput.test.jsx**

**Purpose:** This file contains integration tests for the QuickInput and InteractionList components.

**Components:**
1. QuickInput: Renders a text input for quick interactions.
2. InteractionList: Renders a list of interactions with hover and delete button interactions.

**Functions:**
1. mockOnSubmit(): Creates a mock function to test callbacks.
2. mockOnDataChange(): Resets mock functions and simulates interaction data.
3. test(): Runs individual test cases for component interactions.
4. beforeEach(): Sets up mock functions before each test case.

**Dependencies/Integrations:**
- Uses @testing-library/react for rendering and testing.
- Integrates with vitest for test descriptions and expectations.

### `frontend/src/test/setup.js`

**Summary:**  
This file sets up mock objects for speech synthesis and recognition APIs for testing purposes.

**Key Functions/Classes/Components:**
1. `window.speechSynthesis`: Mock object for speech synthesis API with empty functions.
2. `window.SpeechRecognition`: Mock class for speech recognition API with methods like start, stop, and abort.
3. `window.webkitSpeechRecognition`: Alias for `window.SpeechRecognition`.

**Dependencies/Integrations:**  
- Uses Jest-DOM for testing.

### `frontend/vite.config.js`

**Summary:**
Configuration file for Vite build tool with React plugin.

**Key Functions/Classes/Components:**
1. defineConfig(): Configures Vite build tool with specified plugins and settings.
2. react(): Plugin to enable React support in Vite.
3. test: Configuration object for test environment setup.

**Dependencies/Integrations:**
- Vite: Build tool for modern web development.
- @vitejs/plugin-react: Vite plugin for React support.

## Development Continuation Prompt

*Copy the following prompt to continue development in a new conversation:*

---

I'm working on a Personal CRM system called "Social Assistant" or "Cirkel" built with FastAPI backend and React frontend. The system tracks interactions with people, uses AI to extract structured information (facts, commitments, people mentioned), and provides semantic search and relationship tracking.

**Current Features:**
1. **Shadow Entity System** - tracks mentions of people before they're added to the system
2. **Name Learning System** - smart name matching with aliases support (persons/person_aliases tables)
3. **Multi-person name confirmation** with smart detection (existing/shadow/new)
4. **AI keyword extraction** displayed on sticky notes
5. **Timeline and Reminders views** with bottom navigation
6. **Meeting prep** with AI suggestions
7. **Semantic search** using ChromaDB vector database

**Tech Stack:**
- Backend: FastAPI, SQLite, ChromaDB for vector search, OpenAI API
- Frontend: React with inline styles, no UI libraries
- AI: OpenAI GPT for extraction, sentence-transformers for embeddings

**Key Files Structure:**
- `app.py`: FastAPI endpoints
- `managers/`: Business logic (InteractionManager, SearchManager, IntelligenceManager, NameLearningManager)
- `core/`: Core functions (storage.py, extraction.py, retrieval.py, suggestions.py, name_learning.py)
- `frontend/src/components/`: React components
- `models/schemas.py`: Pydantic models with ExtractedInfo schema

**Database Schema:**
- `events`: Main interaction records (includes person_id for v2)
- `shadow_entities`: Tracks mentioned but not-yet-added people
- `persons`: Person entities with canonical names
- `person_aliases`: Maps aliases to person_ids

**Recent Development:**
- Implemented database v2 with person_id and alias support
- Added backward compatibility for existing data
- Created NameLearningSystem for intelligent name matching
- Frontend has NameConfirm component for smart name resolution

**Next Steps to Consider:**
1. Enhance real-time name suggestions during input
2. Add UI for managing person aliases
3. Implement fuzzy matching algorithms
4. Add pattern learning from user confirmations
5. Create bulk import/export functionality

**Note:** All code files are already uploaded to project knowledge. You can reference them directly. 在对话中，除非用户明确指令，否则不要直接写项目代码

---