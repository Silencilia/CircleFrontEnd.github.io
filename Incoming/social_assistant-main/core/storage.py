"""
存储兼容层 - 重定向到新的分层架构
"""

# 为了向后兼容，重新导出主要函数
from core.database import get_db_manager

def init_db():
    """初始化数据库（兼容性函数）"""
    db = get_db_manager()
    
    # 创建所有表
    tables_sql = [
        """
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            person_name TEXT NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
            raw_input TEXT NOT NULL,
            extracted_json TEXT,
            confidence_scores TEXT,
            extraction_model TEXT DEFAULT 'gpt-4o-mini',
            person_id INTEGER,
            event_type TEXT DEFAULT 'interaction'
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS shadow_entities (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            mentioned_by TEXT NOT NULL,
            event_id INTEGER,
            context TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            resolved BOOLEAN DEFAULT FALSE,
            resolved_to TEXT,
            FOREIGN KEY (event_id) REFERENCES events (id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS persons (
            id SERIAL PRIMARY KEY,
            canonical_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS person_aliases (
            id SERIAL PRIMARY KEY,
            person_id INTEGER NOT NULL,
            alias TEXT NOT NULL,
            confidence REAL DEFAULT 1.0,
            source TEXT DEFAULT 'user_input',
            created_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (person_id) REFERENCES persons (id) ON DELETE CASCADE,
            UNIQUE(person_id, alias)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS embeddings (
            id TEXT PRIMARY KEY,
            event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
            person_name TEXT,
            embedding vector(1536),
            document TEXT,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            embedding_type TEXT DEFAULT 'interaction'
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS entities (
            id SERIAL PRIMARY KEY,
            canonical_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            confidence_score FLOAT DEFAULT 1.0
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS name_aliases (
            id SERIAL PRIMARY KEY,
            entity_id INTEGER NOT NULL,
            alias TEXT NOT NULL UNIQUE,
            confidence FLOAT DEFAULT 1.0,
            source TEXT,
            confirm_count INTEGER DEFAULT 0,
            reject_count INTEGER DEFAULT 0,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (entity_id) REFERENCES entities (id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS learning_history (
            id SERIAL PRIMARY KEY,
            input_name TEXT NOT NULL,
            matched_name TEXT,
            user_action TEXT,
            confidence_before FLOAT,
            pattern_detected TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    ]
    
    # 创建索引
    indexes_sql = [
        "CREATE INDEX IF NOT EXISTS embeddings_event_idx ON embeddings(event_id)",
        "CREATE INDEX IF NOT EXISTS embeddings_person_idx ON embeddings(person_name)",
        "CREATE INDEX IF NOT EXISTS idx_alias_lookup ON person_aliases(alias)",
        "CREATE INDEX IF NOT EXISTS idx_entity_lookup ON entities(canonical_name)"
    ]
    
    # 向量索引优化策略
    import os
    if not os.getenv('TESTING'):
        # 使用HNSW索引替代ivfflat，性能更好
        # 只在有数据时创建索引，避免空表索引创建
        vector_index_sql = """
        DO $$
        BEGIN
            IF (SELECT count(*) FROM embeddings) > 0 THEN
                CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings 
                USING hnsw (embedding vector_cosine_ops);
            END IF;
        END $$;
        """
        indexes_sql.insert(0, vector_index_sql)
    
    # 执行表创建
    for table_sql in tables_sql:
        try:
            db.execute_query(table_sql)
        except Exception as e:
            print(f"Warning: Could not create table: {e}")
    
    # 创建索引
    for index_sql in indexes_sql:
        try:
            db.execute_query(index_sql)
        except Exception as e:
            print(f"Warning: Could not create index: {e}")

def reset_database():
    """重置数据库（兼容性函数）"""
    db = get_db_manager()
    
    tables = ['person_aliases', 'persons', 'shadow_entities', 'events', 'embeddings', 
              'name_aliases', 'entities', 'learning_history']
    
    for table in tables:
        try:
            db.execute_query(f"DELETE FROM {table}")
        except:
            pass

def execute_sql(query: str, params: tuple = None):
    """执行SQL（兼容性函数）"""
    db = get_db_manager()
    return db.execute_query(query, params)

# 重新导出新架构的主要函数
from core.services import PersonService, EventService, EmbeddingService

_person_service = None
_event_service = None

def get_person_service():
    global _person_service
    if _person_service is None:
        _person_service = PersonService()
    return _person_service

def get_event_service():
    global _event_service
    if _event_service is None:
        _event_service = EventService()
    return _event_service

# 兼容性函数
def insert_event(person_name: str, raw_input: str, event_type: str = 'interaction') -> int:
    """插入事件（兼容性函数）"""
    person_service = get_person_service()
    event_service = get_event_service()
    
    person_id = person_service.get_or_create_person_id(person_name)
    return event_service.create_event(person_name, person_id, raw_input, event_type)

def get_events_for_person(person_name: str):
    """获取人员事件（兼容性函数）"""
    event_service = get_event_service()
    return event_service.get_person_events(person_name)

def person_exists(person_name: str) -> bool:
    """检查人员是否存在（兼容性函数）"""
    person_service = get_person_service()
    person_info = person_service.get_person_by_alias(person_name)
    return person_info is not None

def get_person_by_alias(alias: str):
    """通过Alias获取人员（兼容性函数）"""
    person_service = get_person_service()
    return person_service.get_person_by_alias(alias)

def get_all_aliases(person_name: str):
    """获取所有Alias（兼容性函数）"""
    person_service = get_person_service()
    return person_service.get_all_aliases(person_name)