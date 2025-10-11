"""
别名数据访问对象 - 处理person_aliases表
"""
from typing import Optional, List, Dict
from datetime import datetime
import logging

from core.database import get_db_manager
from core.utils import normalize_text

logger = logging.getLogger(__name__)

class AliasDAO:
    """别名数据访问对象"""
    
    def __init__(self):
        self.db = get_db_manager()
    
    def create_alias(self, person_id: int, alias: str, confidence: float = 1.0, 
                    source: str = 'user_input') -> int:
        """创建新别名"""
        normalized_alias = normalize_text(alias)
        
        query = """
        INSERT INTO person_aliases (person_id, alias, confidence, source, created_at)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """
        
        params = (person_id, normalized_alias, confidence, source, datetime.now())
        return self.db.execute_insert(query, params)
    
    def get_person_id_by_alias(self, alias: str) -> Optional[int]:
        """通过别名获取person_id"""
        normalized_alias = normalize_text(alias)
        
        query = """
        SELECT person_id
        FROM person_aliases
        WHERE LOWER(alias) = LOWER(%s)
        """
        
        result = self.db.execute_query(query, (normalized_alias,))
        return result[0]['person_id'] if result else None
    
    def get_aliases_by_person_id(self, person_id: int) -> List[Dict]:
        """获取某人的所有别名"""
        query = """
        SELECT id, alias, confidence, source, created_at
        FROM person_aliases
        WHERE person_id = %s
        ORDER BY confidence DESC, created_at DESC
        """
        
        return self.db.execute_query(query, (person_id,))
    
    def get_alias_by_name(self, alias: str) -> Optional[Dict]:
        """通过别名获取别名记录 - 返回第一个匹配（向后兼容）"""
        normalized_alias = normalize_text(alias)
        
        query = """
        SELECT id, person_id, alias, confidence, source, created_at
        FROM person_aliases
        WHERE LOWER(alias) = LOWER(%s)
        ORDER BY confidence DESC, created_at ASC
        """
        
        result = self.db.execute_query(query, (normalized_alias,))
        return result[0] if result else None
    
    def get_all_aliases_by_name(self, alias: str) -> List[Dict]:
        """通过别名获取所有匹配的别名记录（支持多人使用相同别名）"""
        normalized_alias = normalize_text(alias)
        
        query = """
        SELECT id, person_id, alias, confidence, source, created_at
        FROM person_aliases
        WHERE LOWER(alias) = LOWER(%s)
        ORDER BY confidence DESC, created_at ASC
        """
        
        return self.db.execute_query(query, (normalized_alias,))
    
    def update_alias_confidence(self, alias: str, new_confidence: float) -> bool:
        """更新别名置信度"""
        query = """
        UPDATE person_aliases
        SET confidence = %s
        WHERE LOWER(alias) = LOWER(%s)
        """
        
        try:
            self.db.execute_query(query, (new_confidence, alias))
            return True
        except Exception as e:
            logger.error(f"Error updating alias confidence: {e}")
            return False
    
    def delete_alias(self, alias: str) -> bool:
        """删除别名"""
        query = "DELETE FROM person_aliases WHERE LOWER(alias) = LOWER(%s)"
        
        try:
            self.db.execute_query(query, (alias,))
            return True
        except Exception as e:
            logger.error(f"Error deleting alias: {e}")
            return False
    
    def move_aliases_to_person(self, from_person_id: int, to_person_id: int) -> bool:
        """将别名从一个人转移到另一个人"""
        query = """
        UPDATE person_aliases
        SET person_id = %s
        WHERE person_id = %s
        """
        
        try:
            self.db.execute_query(query, (to_person_id, from_person_id))
            return True
        except Exception as e:
            logger.error(f"Error moving aliases: {e}")
            return False
    
    def count_aliases_for_person(self, person_id: int) -> int:
        """统计某人的别名数量"""
        query = "SELECT COUNT(*) as count FROM person_aliases WHERE person_id = %s"
        
        result = self.db.execute_query(query, (person_id,))
        return result[0]['count'] if result else 0
