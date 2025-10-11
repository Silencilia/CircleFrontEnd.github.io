"""
搜索管理器 - 基于新分层架构
"""
from typing import Dict, List, Optional
import logging

from core.services import PersonService, EmbeddingService, EventService

logger = logging.getLogger(__name__)

class SearchManager:
    """搜索管理器 - 处理搜索相关的业务流程"""
    
    def __init__(self):
        self.person_service = PersonService()
        self.embedding_service = EmbeddingService()
        self.event_service = EventService()
        
        # 缓存最后的搜索结果
        self.last_query = None
        self.last_results = []
    
    def _is_likely_person_name_query(self, query: str) -> bool:
        """检测查询是否像人名（短词、首字母大写、不含特殊字符）"""
        if not query or not query.strip():
            return False
        
        # 移除首尾空格并分割
        words = query.strip().split()
        
        # 1-3个单词
        if not (1 <= len(words) <= 3):
            return False
        
        # 检查每个单词
        for word in words:
            # 必须是字母（允许连字符）
            if not word.replace('-', '').isalpha():
                return False
            # 首字母必须大写
            if not word[0].isupper():
                return False
        
        return True
    
    def _deduplicate_results(self, results: List[Dict]) -> List[Dict]:
        """基于文档内容去重，保留相似度更高的结果"""
        seen_documents = {}
        
        for result in results:
            # 清理文档内容作为去重键
            doc_content = result.get('document', '')
            clean_content = doc_content.split('|PRESELECTED:')[0].strip()
            
            # 跳过空内容
            if not clean_content:
                continue
            
            # 检查是否已存在，保留相似度更高的
            if clean_content in seen_documents:
                existing = seen_documents[clean_content]
                current_similarity = result.get('similarity', 0)
                existing_similarity = existing.get('similarity', 0)
                
                if current_similarity > existing_similarity:
                    # 替换为更高相似度的结果
                    seen_documents[clean_content] = result
            else:
                seen_documents[clean_content] = result
        
        # 返回去重后的结果，保持原始顺序
        deduplicated = []
        seen_clean_contents = set()
        
        for result in results:
            doc_content = result.get('document', '')
            clean_content = doc_content.split('|PRESELECTED:')[0].strip()
            
            if clean_content and clean_content not in seen_clean_contents:
                # 使用最高相似度的版本
                if clean_content in seen_documents:
                    deduplicated.append(seen_documents[clean_content])
                    seen_clean_contents.add(clean_content)
        
        return deduplicated
    
    def search_interactions(self, query: str, person: Optional[str] = None, 
                          limit: int = 5) -> Dict:
        """搜索交互"""
        try:
            self.last_query = query
            
            # 检测是否为人名查询
            is_person_query = self._is_likely_person_name_query(query)
            
            # 执行语义搜索（EmbeddingService会自动处理人名优化）
            search_result = self.embedding_service.semantic_search(
                query, limit=limit, person_filter=person
            )
            
            results = search_result.get('results', [])
            
            # 增强结果：添加标准名称
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
            
            # 基于内容去重
            deduplicated_results = self._deduplicate_results(enhanced_results)
            
            self.last_results = deduplicated_results
            
            return {
                "query": query,
                "person_filter": person,
                "is_person_query": is_person_query,
                "results": deduplicated_results,
                "count": len(deduplicated_results)
            }
            
        except Exception as e:
            logger.error(f"Error searching interactions: {e}")
            return {"error": str(e)}
    
    def find_connections(self, person: str, limit: int = 5) -> Dict:
        """查找人员连接"""
        try:
            # 搜索提到这个人的关系
            search_result = self.embedding_service.semantic_search(
                f"knows {person}", limit=limit
            )
            
            # 过滤关系类型的结果
            connections = []
            for result in search_result.get('results', []):
                if result.get('embedding_type') == 'relationship':
                    metadata = result.get('metadata', {})
                    connections.append({
                        'document': result.get('document', ''),
                        'metadata': metadata,
                        'similarity': result.get('similarity', 0.0),
                        'person': metadata.get('primary_person'),
                        'mentioned': metadata.get('mentioned_person')
                    })
            
            return {
                "person": person,
                "connections": connections,
                "count": len(connections)
            }
            
        except Exception as e:
            logger.error(f"Error finding connections: {e}")
            return {"error": str(e)}
    
    def list_recent_interactions(self, limit: int = 10) -> Dict:
        """获取最近的交互列表"""
        try:
            # 获取最近的人员
            recent_people = self.event_service.get_recent_people(limit)
            
            # 增强数据：添加Alias信息
            enhanced_events = []
            for event in recent_people:
                person_name = event['person_name']
                person_id = event['person_id']
                
                # 获取Alias信息
                aliases_data = self.person_service.get_all_aliases(person_name)
                
                enhanced_events.append({
                    "id": event.get('id'),
                    "person_name": person_name,
                    "canonical_name": aliases_data.get('canonical_name', person_name),
                    "person_id": person_id,
                    "timestamp": event['timestamp'],
                    "raw_input": event['raw_input'][:100] if len(event['raw_input']) > 100 else event['raw_input'],
                    "aliases": aliases_data.get('aliases', [])[:3],
                    "has_aliases": len(aliases_data.get('aliases', [])) > 1
                })
            
            return {
                "events": enhanced_events,
                "people": enhanced_events,  # 为了兼容性
                "count": len(enhanced_events),
                "unique_people": len(enhanced_events)
            }
            
        except Exception as e:
            logger.error(f"Error listing recent interactions: {e}")
            return {"error": str(e)}
    
    def get_person_timeline(self, name: str) -> Dict:
        """获取人员时间线"""
        try:
            # 获取人员信息
            person_info = self.person_service.get_person_by_alias(name)
            if not person_info:
                return {
                    "person": name,
                    "events": [],
                    "total": 0,
                    "exists": False
                }
            
            # 获取Alias信息
            aliases_data = self.person_service.get_all_aliases(name)
            
            # 获取事件
            events = self.event_service.get_person_events(name)
            
            # 增强事件数据
            enhanced_events = []
            for event in events:
                enhanced_event = event.copy()
                
                # 解析extracted_json
                if event.get('extracted_json'):
                    try:
                        import json
                        extracted = json.loads(event['extracted_json'])
                        enhanced_event['keywords'] = extracted.get('keywords', [])
                        enhanced_event['people_mentioned'] = [
                            p['name'] for p in extracted.get('people_mentioned', [])
                        ]
                        enhanced_event['topics'] = extracted.get('topics', [])
                        enhanced_event['sentiment'] = extracted.get('sentiment', 'neutral')
                    except:
                        enhanced_event['keywords'] = []
                        enhanced_event['people_mentioned'] = []
                        enhanced_event['topics'] = []
                        enhanced_event['sentiment'] = 'neutral'
                
                enhanced_events.append(enhanced_event)
            
            return {
                "person": name,
                "canonical_name": person_info['canonical_name'],
                "person_id": person_info['id'],
                "aliases": [a['alias'] for a in aliases_data.get('aliases', [])],
                "alias_count": len(aliases_data.get('aliases', [])),
                "events": enhanced_events,
                "total": len(enhanced_events),
                "exists": True
            }
            
        except Exception as e:
            logger.error(f"Error getting person timeline: {e}")
            return {"error": str(e)}
    
    def get_people_statistics(self) -> Dict:
        """获取人员统计信息（API兼容性）"""
        try:
            from core.database import get_db_manager
            db = get_db_manager()
            
            # 总人数
            total_result = db.execute_query("SELECT COUNT(*) as count FROM persons")
            total_people = total_result[0]['count'] if total_result else 0
            
            # 总Alias数
            aliases_result = db.execute_query("SELECT COUNT(*) as count FROM person_aliases")
            total_aliases = aliases_result[0]['count'] if aliases_result else 0
            
            # 活跃人员（最近30天）
            active_result = db.execute_query("""
                SELECT COUNT(DISTINCT person_id) as count 
                FROM events 
                WHERE timestamp > NOW() - INTERVAL '30 days'
            """)
            active_people = active_result[0]['count'] if active_result else 0
            
            # 最活跃的人
            top_result = db.execute_query("""
                SELECT p.canonical_name, COUNT(e.id) as interaction_count
                FROM persons p
                JOIN events e ON e.person_id = p.id
                GROUP BY p.id, p.canonical_name
                ORDER BY interaction_count DESC
                LIMIT 10
            """)
            
            most_active = [
                {"name": row['canonical_name'], "interactions": row['interaction_count']}
                for row in top_result
            ]
            
            return {
                "total_people": total_people,
                "total_aliases": total_aliases,
                "active_last_30_days": active_people,
                "most_active": most_active
            }
            
        except Exception as e:
            logger.error(f"Error getting people statistics: {e}")
            return {"error": str(e)}