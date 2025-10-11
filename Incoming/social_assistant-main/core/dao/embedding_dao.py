"""
嵌入向量数据访问对象 - 处理embeddings表和pgvector操作
"""
from typing import Optional, List, Dict
from datetime import datetime
import json
import logging

from core.database import get_db_manager

logger = logging.getLogger(__name__)

class EmbeddingDAO:
    """嵌入向量数据访问对象"""
    
    def __init__(self):
        self.db = get_db_manager()
    
    def store_embedding(self, doc_id: str, event_id: int, person_name: str, 
                       embedding: List[float], document: str, metadata: dict,
                       embedding_type: str = "interaction") -> bool:
        """存储嵌入向量"""
        query = """
        INSERT INTO embeddings (id, event_id, person_name, embedding, document, metadata, embedding_type, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            embedding = EXCLUDED.embedding,
            document = EXCLUDED.document,
            metadata = EXCLUDED.metadata,
            created_at = CURRENT_TIMESTAMP
        """
        
        try:
            params = (
                doc_id,
                event_id,
                person_name,
                str(embedding),  # pgvector会解析
                document,
                json.dumps(metadata),
                embedding_type,
                datetime.now()
            )
            
            self.db.execute_query(query, params)
            return True
            
        except Exception as e:
            logger.error(f"Error storing embedding: {e}")
            return False
    
    def _is_likely_person_name_query(self, query_text: str) -> bool:
        """检测查询是否像人名（短词、首字母大写）"""
        if not query_text:
            return False
        
        words = query_text.strip().split()
        # 1-3个单词，且每个单词首字母大写
        return (1 <= len(words) <= 3 and 
                all(word and word[0].isupper() and word.isalpha() for word in words))

    def search_similar_embeddings(self, query_embedding: List[float], 
                                 limit: int = 10, person_filter: Optional[str] = None,
                                 query_text: Optional[str] = None) -> List[Dict]:
        """使用pgvector搜索相似嵌入，对人名类型结果进行权重优化"""
        # 检测是否为人名查询
        is_person_query = query_text and self._is_likely_person_name_query(query_text)
        
        if is_person_query:
            # 对人名查询使用权重调整的SQL
            base_query = """
            SELECT 
                id,
                event_id,
                person_name,
                document,
                metadata,
                embedding_type,
                CASE 
                    WHEN embedding_type = 'person_name' THEN (embedding <-> %s::vector) * 0.8
                    ELSE (embedding <-> %s::vector)
                END as distance
            FROM embeddings
            """
            params = [str(query_embedding), str(query_embedding)]
        else:
            # 普通查询保持原有逻辑
            base_query = """
            SELECT 
                id,
                event_id,
                person_name,
                document,
                metadata,
                embedding_type,
                (embedding <-> %s::vector) as distance
            FROM embeddings
            """
            params = [str(query_embedding)]
        
        # 添加人员过滤器
        if person_filter:
            base_query += " WHERE person_name = %s"
            params.append(person_filter)
        
        base_query += """
        ORDER BY distance
        LIMIT %s
        """
        params.append(limit)
        
        try:
            results = self.db.execute_query(base_query, tuple(params))
            
            # 转换metadata从JSON字符串到字典
            for result in results:
                try:
                    result['metadata'] = json.loads(result['metadata']) if isinstance(result['metadata'], str) else result['metadata']
                    result['similarity'] = 1.0 - result['distance']  # 转换距离为相似度
                except json.JSONDecodeError:
                    result['metadata'] = {}
                    result['similarity'] = 0.0
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching embeddings: {e}")
            return []
    
    def get_embedding_by_id(self, doc_id: str) -> Optional[Dict]:
        """通过ID获取嵌入"""
        query = """
        SELECT id, event_id, person_name, document, metadata, embedding_type, created_at
        FROM embeddings
        WHERE id = %s
        """
        
        result = self.db.execute_query(query, (doc_id,))
        if result:
            row = result[0]
            try:
                row['metadata'] = json.loads(row['metadata']) if isinstance(row['metadata'], str) else row['metadata']
            except json.JSONDecodeError:
                row['metadata'] = {}
            return row
        return None
    
    def delete_embedding(self, doc_id: str) -> bool:
        """删除嵌入"""
        query = "DELETE FROM embeddings WHERE id = %s"
        
        try:
            self.db.execute_query(query, (doc_id,))
            return True
        except Exception as e:
            logger.error(f"Error deleting embedding: {e}")
            return False
    
    def delete_embeddings_by_event_id(self, event_id: int) -> int:
        """删除某事件的所有嵌入"""
        # 先获取数量
        count_query = "SELECT COUNT(*) as count FROM embeddings WHERE event_id = %s"
        count_result = self.db.execute_query(count_query, (event_id,))
        count = count_result[0]['count'] if count_result else 0
        
        # 删除嵌入
        delete_query = "DELETE FROM embeddings WHERE event_id = %s"
        self.db.execute_query(delete_query, (event_id,))
        
        return count
    
    def get_embeddings_by_type(self, embedding_type: str, limit: Optional[int] = None) -> List[Dict]:
        """按类型获取嵌入"""
        query = """
        SELECT id, event_id, person_name, document, metadata, embedding_type, created_at
        FROM embeddings
        WHERE embedding_type = %s
        ORDER BY created_at DESC
        """
        
        if limit:
            query += " LIMIT %s"
            params = (embedding_type, limit)
        else:
            params = (embedding_type,)
        
        return self.db.execute_query(query, params)
    
    def clear_all_embeddings(self) -> int:
        """清除所有嵌入"""
        count_query = "SELECT COUNT(*) as count FROM embeddings"
        count_result = self.db.execute_query(count_query)
        count = count_result[0]['count'] if count_result else 0
        
        delete_query = "DELETE FROM embeddings"
        self.db.execute_query(delete_query)
        
        return count
