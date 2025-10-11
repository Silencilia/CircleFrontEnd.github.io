"""
搜索管理器 - 纯业务逻辑编排层
"""
from typing import Dict, List, Optional
import logging

from core.services import PersonService, EmbeddingService
from core.dao import EventDAO

logger = logging.getLogger(__name__)

class SearchManager:
    """搜索管理器 - 编排搜索相关的业务流程"""
    
    def __init__(self):
        self.person_service = PersonService()
        self.embedding_service = EmbeddingService()
        self.event_dao = EventDAO()
        
        # 缓存最后的搜索结果
        self.last_query = None
        self.last_results = []
    
    def search_interactions(self, query: str, person: Optional[str] = None, 
                          limit: int = 5) -> Dict:
        """搜索交互（业务流程编排）"""
        try:
            self.last_query = query
            
            # 1. 处理人员过滤器
            person_filter = None
            canonical_name = person
            all_aliases = []
            
            if person:
                # 获取人员信息和所有Alias
                person_info = self.person_service.get_person_by_alias(person)
                if person_info:
                    canonical_name = person_info['canonical_name']
                    aliases_data = self.person_service.get_all_aliases(person)
                    if aliases_data['success']:
                        all_aliases = [a['alias'] for a in aliases_data['aliases']]
                        person_filter = canonical_name
                else:
                    person_filter = person
            
            # 2. 执行语义搜索
            search_result = self.embedding_service.semantic_search(
                query, limit=limit * 2, person_filter=person_filter
            )
            
            results = search_result.get('results', [])
            
            # 3. 如果有Alias，搜索其他Alias下的事件
            if all_aliases and len(all_aliases) > 1:
                for alias in all_aliases[:3]:  # 限制搜索数量
                    if alias != person_filter:
                        alias_search = self.embedding_service.semantic_search(
                            query, limit=limit, person_filter=alias
                        )
                        results.extend(alias_search.get('results', []))
                
                # 去重（按event_id）
                seen_events = set()
                unique_results = []
                for r in results:
                    event_id = r.get('metadata', {}).get('event_id')
                    if event_id and event_id not in seen_events:
                        seen_events.add(event_id)
                        unique_results.append(r)
                results = unique_results[:limit]
            else:
                results = results[:limit]
            
            # 4. 增强结果：添加标准名称
            enhanced_results = []
            for result in results:
                enhanced_result = result.copy()
                person_name_in_result = result.get('metadata', {}).get('person_name')
                if person_name_in_result:
                    person_info = self.person_service.get_person_by_alias(person_name_in_result)
                    if person_info:
                        enhanced_result['canonical_name'] = person_info['canonical_name']
                        enhanced_result['matched_as'] = person_name_in_result
                    else:
                        enhanced_result['canonical_name'] = person_name_in_result
                        enhanced_result['matched_as'] = person_name_in_result
                enhanced_results.append(enhanced_result)
            
            self.last_results = enhanced_results
            
            return {
                "query": query,
                "person_filter": person,
                "canonical_filter": canonical_name if person else None,
                "results": enhanced_results,
                "count": len(enhanced_results),
                "searched_aliases": all_aliases[:3] if all_aliases else []
            }
            
        except Exception as e:
            logger.error(f"Error searching interactions: {e}")
            return {"error": str(e)}
    
    def find_connections(self, person: str, limit: int = 5) -> Dict:
        """查找人员连接（业务流程编排）"""
        try:
            # 1. 获取人员的所有Alias
            canonical_name = person
            all_names = [person]
            
            person_info = self.person_service.get_person_by_alias(person)
            if person_info:
                canonical_name = person_info['canonical_name']
                aliases_data = self.person_service.get_all_aliases(person)
                if aliases_data['success']:
                    all_names = [a['alias'] for a in aliases_data['aliases']]
            
            # 2. 搜索关系（使用嵌入服务的关系搜索）
            all_results = []
            for name in all_names[:5]:  # 限制搜索数量
                # 搜索提到这个人的关系
                search_result = self.embedding_service.semantic_search(
                    f"knows {name}", limit=limit
                )
                
                # 过滤关系类型的结果
                for result in search_result.get('results', []):
                    if result.get('embedding_type') == 'relationship':
                        all_results.append(result)
            
            # 3. 去重和排序
            seen = set()
            unique_results = []
            for r in all_results:
                metadata = r.get('metadata', {})
                key = f"{metadata.get('primary_person')}_{metadata.get('mentioned_person')}"
                if key not in seen:
                    seen.add(key)
                    # 增强结果：添加标准名称
                    enhanced = r.copy()
                    primary_person = metadata.get('primary_person')
                    if primary_person:
                        person_info = self.person_service.get_person_by_alias(primary_person)
                        if person_info:
                            enhanced['canonical_connector'] = person_info['canonical_name']
                    unique_results.append(enhanced)
            
            # 按相似度排序并限制结果
            unique_results.sort(key=lambda x: x.get('similarity', 0), reverse=True)
            unique_results = unique_results[:limit]
            
            return {
                "person": person,
                "canonical_name": canonical_name,
                "searched_names": all_names[:5],
                "connections": unique_results,
                "count": len(unique_results)
            }
            
        except Exception as e:
            logger.error(f"Error finding connections: {e}")
            return {"error": str(e)}
    
    def update_interaction(self, person_name: str, text: str) -> Dict:
        """更新交互（添加新的交互记录）"""
        # 更新实际上就是添加新的交互
        return self.add_interaction(person_name, text, event_type='update')
    
    def get_interaction_stats(self, person_name: str) -> Dict:
        """获取交互统计信息"""
        try:
            person_info = self.person_service.get_person_by_alias(person_name)
            if not person_info:
                return {"exists": False, "total_interactions": 0}
            
            events = self.event_dao.get_events_by_person_id(person_info['id'])
            
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
