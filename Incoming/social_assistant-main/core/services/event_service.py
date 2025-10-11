"""
事件服务 - 处理事件相关的业务逻辑
"""
from typing import Optional, Dict, List
import logging

from core.dao import EventDAO, PersonDAO
from core.utils import normalize_text

logger = logging.getLogger(__name__)

class EventService:
    """事件服务 - 处理事件的核心逻辑"""
    
    def __init__(self):
        self.event_dao = EventDAO()
        self.person_dao = PersonDAO()
    
    def create_event(self, person_name: str, person_id: int, raw_input: str, 
                    event_type: str = 'interaction') -> int:
        """创建事件（业务逻辑）"""
        normalized_name = normalize_text(person_name)
        
        # 创建事件
        event_id = self.event_dao.create_event(normalized_name, person_id, raw_input, event_type)
        
        # 更新人员的最后更新时间
        self.person_dao.update_person_timestamp(person_id)
        
        return event_id
    
    def get_person_events(self, person_name: str, limit: Optional[int] = None) -> List[Dict]:
        """获取人员的所有事件"""
        # 首先通过别名查找person_id
        from core.services.person_service import PersonService
        person_service = PersonService()
        
        person_info = person_service.get_person_by_alias(person_name)
        if not person_info:
            return []
        
        return self.event_dao.get_events_by_person_id(person_info['id'], limit)
    
    def update_event_extraction(self, event_id: int, extracted_json: str, 
                               confidence_scores: str, extraction_model: str) -> bool:
        """更新事件的AI提取结果"""
        return self.event_dao.update_event_extraction(
            event_id, extracted_json, confidence_scores, extraction_model
        )
    
    def delete_event(self, event_id: int) -> bool:
        """删除单个事件"""
        return self.event_dao.delete_event(event_id)
    
    def delete_person_events(self, person_name: str) -> int:
        """删除某人的所有事件"""
        from core.services.person_service import PersonService
        person_service = PersonService()
        
        person_info = person_service.get_person_by_alias(person_name)
        if not person_info:
            return 0
        
        return self.event_dao.delete_events_by_person_id(person_info['id'])
    
    def get_recent_events(self, limit: int = 10) -> List[Dict]:
        """获取最近的事件"""
        return self.event_dao.get_recent_events(limit)
    
    def get_recent_people(self, limit: int = 10) -> List[Dict]:
        """获取最近有交互的人员"""
        return self.event_dao.get_recent_people(limit)
    
    def event_exists(self, event_id: int) -> bool:
        """检查事件是否存在"""
        event = self.event_dao.get_event_by_id(event_id)
        return event is not None
    
    def get_event_details(self, event_id: int) -> Optional[Dict]:
        """获取事件详细信息"""
        return self.event_dao.get_event_by_id(event_id)
