"""
交互管理器 - 纯业务逻辑编排层
"""
from typing import Dict, Optional
import logging

from core.services import PersonService, EmbeddingService, EventService

logger = logging.getLogger(__name__)

class InteractionManager:
    """交互管理器 - 编排交互相关的业务流程"""
    
    def __init__(self):
        self.person_service = PersonService()
        self.embedding_service = EmbeddingService()
        self.event_service = EventService()
        
        # 当前处理的交互信息
        self.person_name = None
        self.event_id = None
    
    def add_interaction(self, text: str, event_type: str = 'interaction',
                       async_mode: bool = False, person_name: str = None) -> Dict:
        """添加交互（完整业务流程）"""
        try:
            # 使用传入的person_name或已设置的person_name
            if person_name:
                self.person_name = person_name
            
            if not self.person_name:
                return {"success": False, "error": "Person name is required"}
            
            # 1. 获取或创建人员ID
            person_id = self.person_service.get_or_create_person_id(self.person_name)
            
            # 2. 创建事件记录
            self.event_id = self.event_service.create_event(self.person_name, person_id, text, event_type)
            
            # 3. 执行AI提取（如果不是异步模式）
            if not async_mode:
                try:
                    from core.extraction import extract_information
                    import json
                    
                    extracted_info, confidence_scores = extract_information(text, self.person_name)
                    extracted_json = json.dumps(extracted_info.model_dump())
                    confidence_json = json.dumps(confidence_scores)
                    
                    # 更新事件的提取结果
                    self.event_service.update_event_extraction(
                        self.event_id, extracted_json, confidence_json, 'gpt-4o-mini'
                    )
                    
                except Exception as e:
                    logger.warning(f"AI extraction failed: {e}")
            
            # 4. 索引到向量数据库
            index_success = self.embedding_service.index_event(self.event_id, self.person_name, text)
            
            result = {
                "success": True,
                "event_id": self.event_id,
                "person_id": person_id,
                "person_name": self.person_name,
                "indexed": index_success
            }
            
            if async_mode:
                result["async_processing"] = True
                result["needs_confirmation"] = False
            
            return result
            
        except Exception as e:
            logger.error(f"Error adding interaction: {e}")
            return {"success": False, "error": str(e)}
    
    def update_interaction_extraction(self, extracted_json: str, confidence_scores: str,
                                    extraction_model: str = 'gpt-4o-mini') -> Dict:
        """更新交互的AI提取结果"""
        if not self.event_id:
            return {"success": False, "error": "No active event to update"}
        
        try:
            # 1. 更新事件的提取结果
            success = self.event_service.update_event_extraction(
                self.event_id, extracted_json, confidence_scores, extraction_model
            )
            
            if not success:
                return {"success": False, "error": "Failed to update event extraction"}
            
            # 2. 重新索引事件（包含新的提取信息）
            event = self.event_service.get_event_details(self.event_id)
            if event:
                self.embedding_service.index_event(
                    self.event_id, 
                    self.person_name, 
                    event['raw_input'], 
                    extracted_json
                )
                
                # 3. 索引关系信息
                self.embedding_service.index_relationships(
                    self.event_id, 
                    self.person_name, 
                    extracted_json
                )
            
            return {
                "success": True,
                "event_id": self.event_id,
                "extracted": extracted_json,
                "reindexed": True
            }
            
        except Exception as e:
            logger.error(f"Error updating extraction: {e}")
            return {"success": False, "error": str(e)}
    
    def delete_interaction(self, person_name: str, event_id: Optional[int] = None, 
                          delete_all: bool = False) -> Dict:
        """删除交互（业务流程编排）"""
        try:
            if delete_all:
                # 删除人员的所有交互
                person_info = self.person_service.get_person_by_alias(person_name)
                if not person_info:
                    return {"success": False, "error": "Person not found"}
                
                deleted_count = self.event_service.delete_person_events(person_name)
                
                return {
                    "success": True,
                    "deleted": deleted_count,
                    "all": True,
                    "person": person_name
                }
            
            elif event_id:
                # 删除特定事件
                success = self.event_service.delete_event(event_id)
                
                if success:
                    return {
                        "success": True,
                        "deleted": 1,
                        "event_id": event_id,
                        "person": person_name
                    }
                else:
                    return {"success": False, "error": "Failed to delete event"}
            
            else:
                return {"success": False, "error": "Must specify event_id or delete_all=True"}
                
        except Exception as e:
            logger.error(f"Error deleting interaction: {e}")
            return {"success": False, "error": str(e)}
    
    def get_interaction_context(self, person_name: str) -> Dict:
        """获取交互上下文（用于AI处理）"""
        try:
            # 获取人员时间线
            timeline = self._get_person_timeline_data(person_name)
            
            # 获取语义相关的交互
            recent_interactions = timeline.get('events', [])[:10]  # 最近10个交互
            
            return {
                "person": person_name,
                "recent_interactions": recent_interactions,
                "total_interactions": timeline.get('total', 0),
                "canonical_name": timeline.get('canonical_name', person_name)
            }
            
        except Exception as e:
            logger.error(f"Error getting interaction context: {e}")
            return {"error": str(e)}
    
    def _get_person_timeline_data(self, person_name: str) -> Dict:
        """获取人员时间线数据（内部辅助方法）"""
        person_info = self.person_service.get_person_by_alias(person_name)
        if not person_info:
            return {"exists": False, "events": [], "total": 0}
        
        events = self.event_service.get_person_events(person_name)
        
        return {
            "exists": True,
            "canonical_name": person_info['canonical_name'],
            "person_id": person_info['id'],
            "events": events,
            "total": len(events)
        }
    
    def get_interaction_stats(self, person_name: str) -> Dict:
        """获取交互统计信息"""
        try:
            person_info = self.person_service.get_person_by_alias(person_name)
            if not person_info:
                return {"exists": False, "total_interactions": 0}
            
            events = self.event_service.get_person_events(person_name)
            
            return {
                "exists": True,
                "person": person_name,
                "canonical_name": person_info['canonical_name'],
                "total_interactions": len(events),
                "first_interaction": events[-1]['timestamp'] if events else None,
                "last_interaction": events[0]['timestamp'] if events else None
            }
            
        except Exception as e:
            logger.error(f"Error getting interaction stats: {e}")
            return {"error": str(e)}
    
    # ===== API兼容性方法 =====
    
    def enrich_add_result(self, add_result: Dict) -> Dict:
        """增强添加结果（API兼容性）"""
        # 新架构中，结果已经足够丰富，直接返回
        return add_result
    
    def update_person_info(self, person_name: str, text: str) -> Dict:
        """更新人员信息（API兼容性）"""
        # 首先检查人员是否存在
        person_info = self.person_service.get_person_by_alias(person_name)
        if not person_info:
            return {
                "success": False,
                "error": f"Person '{person_name}' not found"
            }
        
        # 更新实际上就是添加新的交互
        result = self.add_interaction(text, event_type='update', person_name=person_name)
        
        # 转换为API期望的格式
        if result.get('success'):
            return {
                "success": True,
                "event_id": result.get('event_id'),
                "extracted": None,  # 将在异步处理中填充
                "new_shadows": []
            }
        else:
            return result
    
    def delete_person_events(self, person_name: str) -> int:
        """删除人员的所有事件（API兼容性）"""
        result = self.delete_interaction(person_name, delete_all=True)
        return result.get('deleted', 0)
    
    def delete_event(self, event_id: int) -> bool:
        """删除单个事件（API兼容性）"""
        result = self.delete_interaction("", event_id=event_id)
        return result.get('success', False)
