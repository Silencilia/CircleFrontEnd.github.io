"""
人员管理器 - 纯业务逻辑编排层
"""
from typing import Dict, List, Optional
import logging

from core.services import PersonService, EmbeddingService, EventService

logger = logging.getLogger(__name__)

class PersonManager:
    """人员管理器 - 编排人员相关的业务流程"""
    
    def __init__(self):
        self.person_service = PersonService()
        self.embedding_service = EmbeddingService()
        self.event_service = EventService()
    
    def create_person_with_event(self, person_name: str, raw_input: str, 
                                event_type: str = 'interaction') -> Dict:
        """创建人员并添加首个事件（业务流程编排）"""
        try:
            # 1. 获取或创建人员ID
            person_id = self.person_service.get_or_create_person_id(person_name)
            
            # 2. 创建人名嵌入（非阻塞）
            try:
                self.embedding_service.create_person_name_embedding(person_id, person_name)
            except Exception as e:
                logger.warning(f"Failed to create person name embedding for {person_name}: {e}")
            
            # 3. 创建事件
            event_id = self.event_service.create_event(person_name, person_id, raw_input, event_type)
            
            # 4. 索引到向量数据库
            self.embedding_service.index_event(event_id, person_name, raw_input)
            
            return {
                "success": True,
                "person_id": person_id,
                "event_id": event_id,
                "person_name": person_name
            }
            
        except Exception as e:
            logger.error(f"Error creating person with event: {e}")
            return {"success": False, "error": str(e)}
    
    def get_person_timeline(self, person_name: str) -> Dict:
        """获取人员完整时间线（业务逻辑编排）"""
        try:
            # 1. 获取人员信息
            person_info = self.person_service.get_person_by_alias(person_name)
            if not person_info:
                return {
                    "exists": False,
                    "person": person_name,
                    "events": [],
                    "total": 0
                }
            
            # 2. 获取Alias信息
            aliases_data = self.person_service.get_all_aliases(person_name)
            
            # 3. 获取事件列表
            events = self.event_service.get_person_events(person_name)
            
            return {
                "exists": True,
                "person": person_name,
                "canonical_name": person_info['canonical_name'],
                "person_id": person_info['id'],
                "aliases": aliases_data.get('aliases', []),
                "alias_count": len(aliases_data.get('aliases', [])),
                "events": events,
                "total": len(events)
            }
            
        except Exception as e:
            logger.error(f"Error getting person timeline: {e}")
            return {"error": str(e)}
    
    def merge_persons(self, source_name: str, target_name: str) -> Dict:
        """合并人员（业务流程编排）"""
        try:
            # 1. 执行人员合并
            merge_result = self.person_service.merge_persons(source_name, target_name)
            
            if not merge_result.get('success'):
                return merge_result
            
            # 2. 更新事件的person_name字段
            source_person_id = merge_result['source_id']
            target_person_id = merge_result['target_id']
            
            # 获取目标人员信息
            target_person = self.person_service.get_person_by_alias(target_name)
            if target_person:
                # 更新所有事件的person_name为目标人员的标准名称
                self.event_service.update_events_person_info(
                    source_person_id, target_person_id, target_person['canonical_name']
                )
                
                # 3. 更新目标人员的人名嵌入（非阻塞）
                try:
                    self.embedding_service.update_person_name_embedding(
                        target_person_id, source_name, target_person['canonical_name']
                    )
                except Exception as e:
                    logger.warning(f"Failed to update person name embedding after merge: {e}")
            
            return merge_result
            
        except Exception as e:
            logger.error(f"Error merging persons: {e}")
            return {"success": False, "error": str(e)}
    
    def delete_person_completely(self, person_name: str) -> Dict:
        """完全删除人员及其所有数据（业务流程编排）"""
        try:
            # 1. 获取人员信息
            person_info = self.person_service.get_person_by_alias(person_name)
            if not person_info:
                return {"success": False, "error": "Person not found"}
            
            person_id = person_info['id']
            
            # 2. 删除所有事件
            deleted_events = self.event_service.delete_person_events(person_name)
            
            # 3. 删除向量嵌入（通过事件ID）
            # 这将通过外键约束自动删除
            
            # 4. 删除人员（级联删除Alias）
            self.person_service.person_dao.delete_person(person_id)
            
            return {
                "success": True,
                "deleted_person": person_name,
                "deleted_events": deleted_events,
                "person_id": person_id
            }
            
        except Exception as e:
            logger.error(f"Error deleting person completely: {e}")
            return {"success": False, "error": str(e)}
    
    def get_recent_people(self, limit: int = 10) -> Dict:
        """获取最近的人员列表（业务逻辑编排）"""
        try:
            # 获取最近的事件
            recent_events = self.event_service.get_recent_people(limit)
            
            # 增强数据：添加Alias信息
            enhanced_people = []
            for event in recent_events:
                person_id = event['person_id']
                if person_id:
                    # 获取Alias信息
                    aliases_data = self.person_service.get_all_aliases(event['person_name'])
                    
                    enhanced_people.append({
                        "person_name": event['person_name'],
                        "person_id": person_id,
                        "timestamp": event['timestamp'],
                        "last_interaction": event['raw_input'][:100] if len(event['raw_input']) > 100 else event['raw_input'],
                        "aliases": aliases_data.get('aliases', [])[:3],  # 前3个Alias
                        "alias_count": len(aliases_data.get('aliases', []))
                    })
            
            return {
                "people": enhanced_people,
                "count": len(enhanced_people)
            }
            
        except Exception as e:
            logger.error(f"Error getting recent people: {e}")
            return {"error": str(e)}
