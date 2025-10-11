"""
人员数据访问对象 - 处理persons和person_aliases表
"""
from typing import Optional, List, Dict
from datetime import datetime
import logging

from core.database import get_db_manager
from core.utils import normalize_text

logger = logging.getLogger(__name__)

class PersonDAO:
    """人员数据访问对象"""
    
    def __init__(self):
        self.db = get_db_manager()
    
    def create_person(self, canonical_name: str) -> int:
        """创建新人员，返回person_id"""
        normalized_name = normalize_text(canonical_name)
        
        query = """
        INSERT INTO persons (canonical_name, created_at, updated_at)
        VALUES (%s, %s, %s)
        RETURNING id
        """
        
        now = datetime.now()
        params = (normalized_name, now, now)
        
        return self.db.execute_insert(query, params)
    
    def get_person_by_id(self, person_id: int) -> Optional[Dict]:
        """通过ID获取人员信息"""
        query = """
        SELECT id, canonical_name, created_at, updated_at
        FROM persons
        WHERE id = %s
        """
        
        result = self.db.execute_query(query, (person_id,))
        return result[0] if result else None
    
    def get_person_by_canonical_name(self, canonical_name: str) -> Optional[Dict]:
        """通过标准名称获取人员信息"""
        normalized_name = normalize_text(canonical_name)
        
        query = """
        SELECT id, canonical_name, created_at, updated_at
        FROM persons
        WHERE LOWER(canonical_name) = LOWER(%s)
        """
        
        result = self.db.execute_query(query, (normalized_name,))
        return result[0] if result else None
    
    def update_person_timestamp(self, person_id: int) -> bool:
        """更新人员的最后更新时间"""
        query = """
        UPDATE persons
        SET updated_at = %s
        WHERE id = %s
        """
        
        try:
            self.db.execute_query(query, (datetime.now(), person_id))
            return True
        except Exception as e:
            logger.error(f"Error updating person timestamp: {e}")
            return False
    
    def delete_person(self, person_id: int) -> bool:
        """删除人员（级联删除别名）"""
        query = "DELETE FROM persons WHERE id = %s"
        
        try:
            self.db.execute_query(query, (person_id,))
            return True
        except Exception as e:
            logger.error(f"Error deleting person: {e}")
            return False
    
    def get_all_persons(self, limit: Optional[int] = None) -> List[Dict]:
        """获取所有人员列表"""
        query = """
        SELECT id, canonical_name, created_at, updated_at
        FROM persons
        ORDER BY updated_at DESC
        """
        
        if limit:
            query += " LIMIT %s"
            params = (limit,)
        else:
            params = None
        
        return self.db.execute_query(query, params)
    
    def person_exists(self, canonical_name: str) -> bool:
        """检查人员是否存在"""
        person = self.get_person_by_canonical_name(canonical_name)
        return person is not None
