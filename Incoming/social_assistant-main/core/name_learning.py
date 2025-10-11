"""
Name learning utilities - PostgreSQL版本
只提供名字处理相关的工具函数，不维护任何状态
"""
from typing import List, Dict, Optional, Tuple
from difflib import SequenceMatcher
import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def get_connection():
    """获取PostgreSQL数据库连接"""
    db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/cirkel')
    
    if db_url.startswith('postgresql://') or db_url.startswith('postgres://'):
        import urllib.parse as urlparse
        parsed = urlparse.urlparse(db_url)
        
        return psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],  # Remove leading /
            user=parsed.username,
            password=parsed.password
        )
    else:
        # 如果不是PostgreSQL URL，使用默认本地连接
        return psycopg2.connect(
            host='localhost',
            database='cirkel',
            user=os.getenv('DB_USER', 'user'),
            password=os.getenv('DB_PASSWORD', '')
        )

# 常见昵称映射
COMMON_NICKNAMES = {
    'bill': ['william'],
    'bob': ['robert'],
    'dick': ['richard'],
    'jim': ['james'],
    'mike': ['michael'],
    'tom': ['thomas'],
    'alex': ['alexander', 'alexandra'],  # Alex can match both
    'chris': ['christopher', 'christina'],
    'dan': ['daniel'],
    'dave': ['david'],
    'ed': ['edward'],
    'frank': ['francis'],
    'greg': ['gregory'],
    'jack': ['john'],
    'joe': ['joseph'],
    'matt': ['matthew'],
    'nick': ['nicholas'],
    'pat': ['patrick', 'patricia'],
    'pete': ['peter'],
    'phil': ['philip'],
    'rick': ['richard'],
    'rob': ['robert'],
    'sam': ['samuel'],
    'steve': ['stephen'],
    'tim': ['timothy'],
    'will': ['william'],
    # 女性昵称
    'liz': ['elizabeth'],
    'beth': ['elizabeth'],
    'kate': ['katherine'],
    'cathy': ['catherine'],
    'vicky': ['victoria'],
    'jenny': ['jennifer'],
    'sue': ['susan'],
    'maggie': ['margaret']
}

def init_name_learning_db():
    """初始化名字学习数据库表"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # 实体表 - 一个真实的人
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS entities (
            id SERIAL PRIMARY KEY,
            canonical_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            confidence_score FLOAT DEFAULT 1.0
        )
    """)
    
    # 名字Alias表 - 同一个人的不同称呼
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS name_aliases (
            id SERIAL PRIMARY KEY,
            entity_id INTEGER NOT NULL,
            alias TEXT NOT NULL UNIQUE,
            confidence FLOAT DEFAULT 1.0,
            source TEXT,  -- 'user_confirmed', 'pattern_matched', 'ai_suggested'
            confirm_count INTEGER DEFAULT 0,
            reject_count INTEGER DEFAULT 0,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (entity_id) REFERENCES entities (id)
        )
    """)
    
    # 学习记录表 - 记录每次用户决策
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS learning_history (
            id SERIAL PRIMARY KEY,
            input_name TEXT NOT NULL,
            matched_name TEXT,
            user_action TEXT,  -- 'confirm', 'reject', 'create_new'
            confidence_before FLOAT,
            pattern_detected TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 模式表 - 学习到的模式
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS learned_patterns (
            id SERIAL PRIMARY KEY,
            pattern_type TEXT NOT NULL,  -- 'initial', 'prefix', 'nickname', 'title'
            pattern_data TEXT,  -- JSON格式的模式数据
            success_count INTEGER DEFAULT 0,
            failure_count INTEGER DEFAULT 0,
            confidence FLOAT DEFAULT 0.5,
            examples TEXT,  -- JSON格式的例子
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 创建索引
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alias ON name_aliases(alias)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_entity ON name_aliases(entity_id)")
    
    conn.commit()
    conn.close()

def get_or_create_entity(canonical_name: str) -> int:
    """获取或创建实体ID"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # 先查找是否存在
    cursor.execute("""
        SELECT id FROM entities WHERE canonical_name = %s
    """, (canonical_name,))
    
    result = cursor.fetchone()
    if result:
        entity_id = result[0]
    else:
        # 创建新实体
        cursor.execute("""
            INSERT INTO entities (canonical_name) VALUES (%s) RETURNING id
        """, (canonical_name,))
        entity_id = cursor.fetchone()[0]
        
        # 添加Alias（自己的名字也是Alias）
        cursor.execute("""
            INSERT INTO name_aliases (entity_id, alias, source)
            VALUES (%s, %s, 'user_confirmed')
        """, (entity_id, canonical_name))
        
        conn.commit()
    
    conn.close()
    return entity_id

def find_exact_alias(name: str) -> Optional[Dict]:
    """精确匹配查找Alias"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT e.canonical_name, a.confidence, a.entity_id
        FROM name_aliases a
        JOIN entities e ON a.entity_id = e.id
        WHERE LOWER(a.alias) = LOWER(%s)
    """, (name,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return {
            'name': result[0],
            'confidence': result[1],
            'entity_id': result[2],
            'match_type': 'exact',
            'reason': 'Exact match in database'
        }
    return None

def find_fuzzy_matches(input_name: str, threshold: float = 0.85) -> List[Dict]:
    """模糊匹配查找"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT DISTINCT e.canonical_name, e.id
        FROM entities e
        JOIN name_aliases a ON e.id = a.entity_id
    """)
    
    matches = []
    for canonical_name, entity_id in cursor.fetchall():
        similarity = calculate_name_similarity(input_name, canonical_name)
        if similarity >= threshold:
            matches.append({
                'name': canonical_name,
                'confidence': similarity,
                'entity_id': entity_id,
                'match_type': 'fuzzy',
                'reason': f'Name similarity: {similarity:.2f}'
            })
    
    conn.close()
    return sorted(matches, key=lambda x: x['confidence'], reverse=True)

def find_nickname_match(input_name: str) -> Optional[Dict]:
    """查找昵称匹配"""
    lower_input = input_name.lower()
    
    # 检查是否是已知昵称
    if lower_input in COMMON_NICKNAMES:
        full_names = COMMON_NICKNAMES[lower_input]
        
        # 查找数据库中是否有对应的人
        conn = get_connection()
        cursor = conn.cursor()
        
        for full_name in full_names:
            cursor.execute("""
                SELECT e.canonical_name, e.id
                FROM entities e
                JOIN name_aliases a ON e.id = a.entity_id
                WHERE LOWER(a.alias) LIKE %s
            """, (f'%{full_name}%',))
            
            result = cursor.fetchone()
            if result:
                conn.close()
                return {
                    'name': result[0],
                    'confidence': 0.7,
                    'entity_id': result[1],
                    'match_type': 'nickname',
                    'reason': f'Common nickname: {input_name} -> {full_name}'
                }
        
        conn.close()
    
    return None

def find_pattern_matches(input_name: str) -> List[Dict]:
    """基于模式查找匹配"""
    matches = []
    parts = input_name.split()
    
    if len(parts) == 2:
        first, last = parts
        
        # 初始缩写模式 (e.g., "Bill W")
        if len(last) == 1:
            conn = get_connection()
            cursor = conn.cursor()
            
            # 查找姓氏首字母匹配的人
            cursor.execute("""
                SELECT DISTINCT e.canonical_name, e.id
                FROM entities e
                JOIN name_aliases a ON e.id = a.entity_id
                WHERE LOWER(a.alias) LIKE %s AND LOWER(a.alias) LIKE %s
            """, (f'{first.lower()}%', f'% {last.lower()}%'))
            
            for canonical_name, entity_id in cursor.fetchall():
                name_parts = canonical_name.split()
                if len(name_parts) >= 2 and name_parts[-1][0].lower() == last.lower():
                    matches.append({
                        'name': canonical_name,
                        'confidence': 0.6,
                        'entity_id': entity_id,
                        'match_type': 'pattern',
                        'reason': 'Initial pattern match'
                    })
            
            conn.close()
    
    return matches

def calculate_name_similarity(name1: str, name2: str) -> float:
    """计算两个名字的相似度"""
    return SequenceMatcher(None, name1.lower(), name2.lower()).ratio()

def add_alias(entity_id: int, alias: str, confidence: float = 1.0, source: str = 'user_confirmed') -> bool:
    """为实体添加Alias"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO name_aliases 
            (entity_id, alias, confidence, source, confirm_count)
            VALUES (%s, %s, %s, %s, 1)
            ON CONFLICT (alias) DO UPDATE SET
                confidence = %s,
                source = %s,
                confirm_count = name_aliases.confirm_count + 1,
                last_seen = CURRENT_TIMESTAMP
        """, (entity_id, alias, confidence, source, confidence, source))
        
        conn.commit()
        success = True
    except psycopg2.IntegrityError:
        success = False
    
    conn.close()
    return success

def remove_alias(alias: str) -> bool:
    """从name_learning DB中删除Alias"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # 检查Alias是否存在
        cursor.execute("SELECT entity_id FROM name_aliases WHERE alias = %s", (alias,))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return False
        
        entity_id = result[0]
        
        # 检查是否是该实体的唯一Alias
        cursor.execute("SELECT COUNT(*) FROM name_aliases WHERE entity_id = %s", (entity_id,))
        count = cursor.fetchone()[0]
        
        if count <= 1:
            # 不能删除唯一的Alias
            conn.close()
            return False
        
        # 删除Alias
        cursor.execute("DELETE FROM name_aliases WHERE alias = %s", (alias,))
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error removing alias from name_learning DB: {e}")
        conn.close()
        return False

def record_learning(input_name: str, matched_name: str, is_match: bool, pattern_type: Optional[str] = None):
    """记录学习历史"""
    conn = get_connection()
    cursor = conn.cursor()
    
    action = 'confirm' if is_match else 'reject'
    
    cursor.execute("""
        INSERT INTO learning_history 
        (input_name, matched_name, user_action, pattern_detected)
        VALUES (%s, %s, %s, %s)
    """, (input_name, matched_name, action, pattern_type))
    
    # 更新模式统计
    if pattern_type:
        if is_match:
            cursor.execute("""
                UPDATE learned_patterns 
                SET success_count = success_count + 1,
                    confidence = CAST(success_count + 1 AS FLOAT) / (success_count + failure_count + 2)
                WHERE pattern_type = %s
            """, (pattern_type,))
        else:
            cursor.execute("""
                UPDATE learned_patterns 
                SET failure_count = failure_count + 1,
                    confidence = CAST(success_count AS FLOAT) / (success_count + failure_count + 2)
                WHERE pattern_type = %s
            """, (pattern_type,))
    
    conn.commit()
    conn.close()

def detect_pattern_type(short_form: str, full_form: str) -> Optional[str]:
    """检测匹配模式类型"""
    short_parts = short_form.lower().split()
    full_parts = full_form.lower().split()
    
    if not short_parts or not full_parts:
        return None
    
    # 初始缩写: "Bill W" vs "William Wilson"
    if len(short_parts) == 2 and len(short_parts[1]) == 1:
        if len(full_parts) >= 2 and full_parts[-1][0] == short_parts[1]:
            return 'initial'
    
    # 前缀匹配: "Alex" vs "Alexander"
    if len(short_parts) == 1 and len(full_parts) >= 1:
        if full_parts[0].startswith(short_parts[0]):
            return 'prefix'
    
    # 昵称: "Bill" vs "William"
    if short_parts[0].lower() in COMMON_NICKNAMES:
        for full_name in COMMON_NICKNAMES[short_parts[0].lower()]:
            if full_name in full_form.lower():
                return 'nickname'
    
    return 'fuzzy'

def get_learning_stats() -> Dict:
    """获取学习统计信息"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM entities")
    total_entities = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM name_aliases")
    total_aliases = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM learning_history WHERE user_action = 'confirm'")
    confirmed_matches = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM learning_history WHERE user_action = 'reject'")
    rejected_matches = cursor.fetchone()[0]
    
    # 跳过learned_patterns表（如果不存在）
    try:
        cursor.execute("SELECT COUNT(*) FROM learned_patterns")
        patterns_learned = cursor.fetchone()[0]
    except:
        patterns_learned = 0
    
    stats = {
        'total_entities': total_entities,
        'total_aliases': total_aliases,
        'confirmed_matches': confirmed_matches,
        'rejected_matches': rejected_matches,
        'patterns_learned': patterns_learned
    }
    
    conn.close()
    return stats

def reset_name_learning_db():
    """重置name learning数据库"""
    # import os
    # if os.path.exists(NAME_LEARNING_DB):
    #     os.remove(NAME_LEARNING_DB)
    # # 重新初始化
    # init_name_learning_db()
    pass