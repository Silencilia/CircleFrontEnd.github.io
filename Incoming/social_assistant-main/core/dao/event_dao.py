"""
事件数据访问对象 - 处理events表
"""
from typing import Optional, List, Dict
from datetime import datetime
import logging

from core.database import get_db_manager
from core.utils import normalize_text

logger = logging.getLogger(__name__)

class EventDAO:
    """事件数据访问对象"""
    
    def __init__(self):
        self.db = get_db_manager()
    
    def create_event(self, person_name: str, person_id: int, raw_input: str, 
                    event_type: str = 'interaction') -> int:
        """创建新事件"""
        normalized_name = normalize_text(person_name)
        
        query = """
        INSERT INTO events (person_name, person_id, timestamp, raw_input, event_type)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """
        
        params = (normalized_name, person_id, datetime.now(), raw_input, event_type)
        return self.db.execute_insert(query, params)
    
    def get_event_by_id(self, event_id: int) -> Optional[Dict]:
        """通过ID获取事件"""
        query = """
        SELECT id, person_name, person_id, timestamp, raw_input, 
               extracted_json, confidence_scores, extraction_model, event_type
        FROM events
        WHERE id = %s
        """
        
        result = self.db.execute_query(query, (event_id,))
        return result[0] if result else None
    
    def get_events_by_person_id(self, person_id: int, limit: Optional[int] = None) -> List[Dict]:
        """获取某人的所有事件"""
        query = """
        SELECT id, person_name, person_id, timestamp, raw_input,
               extracted_json, confidence_scores, extraction_model, event_type
        FROM events
        WHERE person_id = %s
        ORDER BY timestamp DESC
        """
        
        if limit:
            query += " LIMIT %s"
            params = (person_id, limit)
        else:
            params = (person_id,)
        
        return self.db.execute_query(query, params)
    
    def get_events_by_person_name(self, person_name: str, limit: Optional[int] = None) -> List[Dict]:
        """通过人员名称获取事件（用于向后兼容）"""
        normalized_name = normalize_text(person_name)
        
        query = """
        SELECT id, person_name, person_id, timestamp, raw_input,
               extracted_json, confidence_scores, extraction_model, event_type
        FROM events
        WHERE LOWER(person_name) = LOWER(%s)
        ORDER BY timestamp DESC
        """
        
        if limit:
            query += " LIMIT %s"
            params = (normalized_name, limit)
        else:
            params = (normalized_name,)
        
        return self.db.execute_query(query, params)
    
    def update_event_extraction(self, event_id: int, extracted_json: str, 
                               confidence_scores: str, extraction_model: str) -> bool:
        """更新事件的提取结果"""
        query = """
        UPDATE events
        SET extracted_json = %s, confidence_scores = %s, extraction_model = %s
        WHERE id = %s
        """
        
        try:
            self.db.execute_query(query, (extracted_json, confidence_scores, extraction_model, event_id))
            return True
        except Exception as e:
            logger.error(f"Error updating event extraction: {e}")
            return False
    
    def delete_event(self, event_id: int) -> bool:
        """删除事件"""
        query = "DELETE FROM events WHERE id = %s"
        
        try:
            self.db.execute_query(query, (event_id,))
            return True
        except Exception as e:
            logger.error(f"Error deleting event: {e}")
            return False
    
    def delete_events_by_person_id(self, person_id: int) -> int:
        """删除某人的所有事件，返回删除数量"""
        # 先获取数量
        count_query = "SELECT COUNT(*) as count FROM events WHERE person_id = %s"
        count_result = self.db.execute_query(count_query, (person_id,))
        count = count_result[0]['count'] if count_result else 0
        
        # 删除事件
        delete_query = "DELETE FROM events WHERE person_id = %s"
        self.db.execute_query(delete_query, (person_id,))
        
        return count
    
    def get_recent_events(self, limit: int = 10) -> List[Dict]:
        """获取最近的事件"""
        query = """
        SELECT id, person_name, person_id, timestamp, raw_input,
               extracted_json, confidence_scores, extraction_model, event_type
        FROM events
        ORDER BY timestamp DESC
        LIMIT %s
        """
        
        return self.db.execute_query(query, (limit,))
    
    def get_recent_people(self, limit: int = 10) -> List[Dict]:
        """获取最近有交互的人员"""
        query = """
        SELECT DISTINCT ON (person_id) 
               person_id, person_name, timestamp, raw_input, extracted_json
        FROM events
        WHERE person_id IS NOT NULL
        ORDER BY person_id, timestamp DESC
        LIMIT %s
        """
        
        return self.db.execute_query(query, (limit,))
    
    def person_exists_by_name(self, person_name: str) -> bool:
        """检查人员是否存在（通过名称）"""
        normalized_name = normalize_text(person_name)
        
        query = "SELECT 1 FROM events WHERE LOWER(person_name) = LOWER(%s) LIMIT 1"
        result = self.db.execute_query(query, (normalized_name,))
        
        return len(result) > 0
