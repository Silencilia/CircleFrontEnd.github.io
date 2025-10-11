"""
嵌入服务 - 处理文本嵌入和向量搜索
"""
import os
from typing import List, Dict, Optional
import json
import logging
from datetime import datetime

from core.dao import EmbeddingDAO
from core.utils import normalize_text
from core.config import USE_OPENAI_EMBEDDING, EMBEDDING_MODEL, LOCAL_EMBEDDING_MODEL
from openai import OpenAI

logger = logging.getLogger(__name__)

# 全局变量
_embedding_model = None
_openai_client = None

class EmbeddingService:
    """嵌入服务 - 处理文本嵌入和向量搜索的核心逻辑"""
    
    def __init__(self):
        self.embedding_dao = EmbeddingDAO()
        self._init_embedding_model()
    
    def _init_embedding_model(self):
        """初始化嵌入模型"""
        global _embedding_model, _openai_client
        
        if USE_OPENAI_EMBEDDING:
            if _openai_client is None:
                _openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        else:
            if _embedding_model is None:
                from sentence_transformers import SentenceTransformer
                _embedding_model = SentenceTransformer(LOCAL_EMBEDDING_MODEL)
                _embedding_model.encode("warmup", convert_to_tensor=False)
    
    def generate_embedding(self, text: str) -> List[float]:
        """生成文本嵌入"""
        if not text or not text.strip():
            logger.warning("Empty text provided for embedding")
            # 根据使用的模型返回相应维度的零向量
            dimension = 1536 if USE_OPENAI_EMBEDDING else 384
            return [0.0] * dimension
        
        try:
            if USE_OPENAI_EMBEDDING and _openai_client:
                response = _openai_client.embeddings.create(
                    model=EMBEDDING_MODEL,
                    input=text
                )
                return response.data[0].embedding
            else:
                # 使用本地模型
                global _embedding_model
                if _embedding_model is None:
                    self._init_embedding_model()
                
                embedding = _embedding_model.encode(text, convert_to_tensor=False)
                return embedding.tolist()
                
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            # 返回零向量作为后备
            dimension = 1536 if USE_OPENAI_EMBEDDING else 384
            return [0.0] * dimension
    
    def create_enriched_document(self, person_name: str, raw_input: str, 
                               extracted_json: Optional[str] = None) -> str:
        """创建增强文档以提高搜索效果"""
        document_parts = [
            f"Person: {person_name}",
            f"Content: {raw_input}"
        ]
        
        # 添加提取的信息
        if extracted_json:
            try:
                extracted = json.loads(extracted_json)
                
                # 优先添加提到的人员
                if extracted.get('people_mentioned'):
                    people_names = [p['name'] for p in extracted['people_mentioned']]
                    people_context = [f"{p['name']}({p.get('context', '')})" for p in extracted['people_mentioned']]
                    document_parts.insert(1, f"PEOPLE MENTIONED: {', '.join(people_names)}. RELATIONSHIPS: {' '.join(people_context)}")
                
                # 添加关键词
                if extracted.get('keywords'):
                    keywords_text = ", ".join(extracted['keywords'])
                    document_parts.append(f"Keywords: {keywords_text}")
                
                # 添加主题
                if extracted.get('topics'):
                    topics_text = ", ".join(extracted['topics'])
                    document_parts.append(f"Topics: {topics_text}")
                
                # 添加事实
                if extracted.get('facts'):
                    facts_text = " ".join([fact.get('fact', '') for fact in extracted['facts']])
                    document_parts.append(f"Facts: {facts_text}")
                    
            except json.JSONDecodeError:
                logger.warning("Could not parse extracted_json for document enrichment")
        
        return " | ".join(document_parts)
    
    def index_event(self, event_id: int, person_name: str, raw_input: str, 
                   extracted_json: Optional[str] = None) -> bool:
        """索引事件到向量数据库"""
        try:
            # 创建增强文档
            document = self.create_enriched_document(person_name, raw_input, extracted_json)
            
            # 生成嵌入
            embedding = self.generate_embedding(document)
            
            # 创建元数据
            metadata = {
                "event_id": event_id,
                "person_name": person_name,
                "event_type": "interaction",
                "timestamp": datetime.now().isoformat()
            }
            
            # 添加提取的数据到元数据
            if extracted_json:
                try:
                    extracted_data = json.loads(extracted_json)
                    if extracted_data.get('keywords'):
                        metadata['keywords'] = extracted_data['keywords']
                    if extracted_data.get('topics'):
                        metadata['topics'] = extracted_data['topics']
                except json.JSONDecodeError:
                    logger.warning(f"Could not parse extracted_json for event {event_id}")
            
            # 存储到向量数据库
            return self.embedding_dao.store_embedding(
                doc_id=f"event_{event_id}",
                event_id=event_id,
                person_name=person_name,
                embedding=embedding,
                document=raw_input,  # 保存原始文本用于显示
                metadata=metadata,
                embedding_type="interaction"
            )
            
        except Exception as e:
            logger.error(f"Error indexing event {event_id}: {e}")
            return False
    
    def index_relationships(self, event_id: int, person_name: str, extracted_json: str) -> bool:
        """索引人员关系信息"""
        if not extracted_json:
            return True
            
        try:
            extracted = json.loads(extracted_json)
            people_mentioned = extracted.get('people_mentioned', [])
            
            if not people_mentioned:
                return True
            
            success_count = 0
            
            # 为每个关系创建嵌入
            for i, person in enumerate(people_mentioned):
                # 跳过自己
                if person['name'] == person_name:
                    continue
                
                # 构建关系文本
                rel_text = f"{person_name} knows {person['name']}"
                if person.get('relationship'):
                    rel_text += f" (relationship: {person['relationship']})"
                if person.get('context'):
                    rel_text += f" - {person['context']}"
                
                # 生成嵌入
                embedding = self.generate_embedding(rel_text)
                
                # 创建元数据
                metadata = {
                    "event_id": event_id,
                    "primary_person": person_name,
                    "mentioned_person": person['name'],
                    "relationship_type": "mentioned_together",
                    "timestamp": datetime.now().isoformat()
                }
                
                # 存储关系嵌入
                success = self.embedding_dao.store_embedding(
                    doc_id=f"relationship_{event_id}_{i}",
                    event_id=event_id,
                    person_name=person_name,
                    embedding=embedding,
                    document=rel_text,
                    metadata=metadata,
                    embedding_type="relationship"
                )
                
                if success:
                    success_count += 1
            
            logger.debug(f"Indexed {success_count} relationships for event {event_id}")
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Error indexing relationships for event {event_id}: {e}")
            return False
    
    def create_person_name_embedding(self, person_id: int, person_name: str) -> bool:
        """为人名创建专用嵌入，提升人名搜索准确性"""
        try:
            normalized_name = normalize_text(person_name)
            if not normalized_name:
                logger.warning("Empty person name provided for embedding")
                return False
            
            # 生成人名嵌入（只包含姓名信息）
            embedding = self.generate_embedding(normalized_name)
            
            # 创建元数据
            metadata = {
                "person_id": person_id,
                "canonical_name": normalized_name,
                "embedding_purpose": "person_name_search",
                "timestamp": datetime.now().isoformat()
            }
            
            # 存储人名嵌入
            return self.embedding_dao.store_embedding(
                doc_id=f"person_name_{person_id}",
                event_id=None,  # 人名嵌入不关联特定事件
                person_name=normalized_name,
                embedding=embedding,
                document=normalized_name,  # 文档就是人名本身
                metadata=metadata,
                embedding_type="person_name"
            )
            
        except Exception as e:
            logger.error(f"Error creating person name embedding for {person_name}: {e}")
            return False
    
    def update_person_name_embedding(self, person_id: int, old_name: str, new_name: str) -> bool:
        """更新人名嵌入（当canonical_name变更时）"""
        try:
            # 删除旧的人名嵌入
            old_doc_id = f"person_name_{person_id}"
            self.embedding_dao.delete_embedding(old_doc_id)
            
            # 创建新的人名嵌入
            return self.create_person_name_embedding(person_id, new_name)
            
        except Exception as e:
            logger.error(f"Error updating person name embedding from {old_name} to {new_name}: {e}")
            return False

    def semantic_search(self, query: str, limit: int = 10, 
                       person_filter: Optional[str] = None) -> Dict:
        """执行智能搜索，自动选择最佳策略（向后兼容但更智能）"""
        try:
            # 自动分类查询意图并选择最佳策略
            intent = self.classify_query_intent(query)
            
            if intent == 'keyword':
                # 关键词查询：结合literal和semantic搜索
                literal_results = self.literal_search(query, limit // 2)
                
                # 生成查询嵌入进行语义搜索
                query_embedding = self.generate_embedding(query)
                semantic_results = self.embedding_dao.search_similar_embeddings(
                    query_embedding, limit // 2, person_filter, query_text=query
                )
                
                # 合并结果，literal优先
                combined_results = literal_results + semantic_results
                # 去重（基于event_id）
                seen_events = set()
                unique_results = []
                for result in combined_results:
                    event_id = result.get('event_id')
                    if event_id and event_id not in seen_events:
                        seen_events.add(event_id)
                        unique_results.append(result)
                
                # 限制结果数量
                unique_results = unique_results[:limit]
                
                return {
                    'query': query,
                    'results': unique_results,
                    'total_results': len(unique_results),
                    'limit': limit,
                    'person_filter': person_filter,
                    'search_strategy': 'hybrid_keyword'
                }
                
            else:
                # 人名查询和语义查询：使用优化的语义搜索
                query_embedding = self.generate_embedding(query)
                results = self.embedding_dao.search_similar_embeddings(
                    query_embedding, limit, person_filter, query_text=query
                )
                
                strategy = 'semantic_person' if intent == 'person' else 'semantic_only'
                
                return {
                    'query': query,
                    'results': results,
                    'total_results': len(results),
                    'limit': limit,
                    'person_filter': person_filter,
                    'search_strategy': strategy
                }
            
        except Exception as e:
            logger.error(f"Error in semantic search: {e}")
            return {
                'query': query,
                'results': [],
                'total_results': 0,
                'limit': limit,
                'person_filter': person_filter,
                'error': str(e)
            }
    
    def classify_query_intent(self, query: str) -> str:
        """
        使用简单规则判断查询意图
        返回: 'person', 'keyword', 'semantic'
        """
        if not query or not query.strip():
            return 'semantic'
        
        # 清理查询文本
        clean_query = query.strip()
        words = clean_query.split()
        
        # 技术术语词典
        tech_terms = {
            # 编程语言
            'python', 'javascript', 'java', 'cpp', 'csharp', 'go', 'rust', 'swift',
            'typescript', 'php', 'ruby', 'kotlin', 'scala', 'r', 'matlab',
            
            # 技术框架
            'react', 'vue', 'angular', 'django', 'flask', 'spring', 'express',
            'fastapi', 'laravel', 'rails', 'nextjs', 'nuxt', 'svelte',
            
            # 数据库
            'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
            'oracle', 'cassandra', 'dynamodb', 'firebase',
            
            # 云服务
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
            'jenkins', 'gitlab', 'github', 'cicd',
            
            # AI/ML
            'tensorflow', 'pytorch', 'sklearn', 'pandas', 'numpy', 'opencv',
            'nlp', 'llm', 'gpt', 'bert', 'transformer', 'embedding',
            
            # 其他技术
            'api', 'rest', 'graphql', 'microservices', 'blockchain', 'crypto',
            'frontend', 'backend', 'fullstack', 'devops', 'sre',
            
            # 业务术语
            'startup', 'fintech', 'saas', 'b2b', 'b2c', 'mvp', 'kpi',
            'roi', 'crm', 'erp', 'hr', 'marketing', 'sales'
        }
        
        # 规则1: 3个词以上 = semantic
        if len(words) >= 3:
            return 'semantic'
        
        # 规则2: 1-2个词的情况
        if 1 <= len(words) <= 2:
            # 检查是否为技术术语
            query_lower = clean_query.lower()
            if any(term in query_lower for term in tech_terms):
                return 'keyword'
            
            # 检查是否为人名格式（首字母大写且为字母）
            if all(word and word[0].isupper() and word.isalpha() for word in words):
                return 'person'
            
            # 其他1-2个词的情况，检查是否可能是关键词
            if all(word.isalpha() for word in words):
                return 'keyword'
        
        # 默认返回semantic
        return 'semantic'

    def literal_search(self, keyword: str, limit: int = 20) -> List[Dict]:
        """
        在raw_input中精确匹配关键词
        使用 PostgreSQL ILIKE 进行大小写不敏感搜索
        """
        try:
            if not keyword or not keyword.strip():
                logger.warning("Empty keyword provided for literal search")
                return []
            
            clean_keyword = keyword.strip()
            
            # 构建SQL查询 - 在raw_input中搜索关键词
            query = """
            SELECT 
                e.id as event_id,
                e.person_name,
                e.person_id,
                e.timestamp,
                e.raw_input as document,
                e.extracted_json,
                e.event_type,
                'literal_match' as search_type
            FROM events e
            WHERE e.raw_input ILIKE %s
            ORDER BY e.timestamp DESC
            LIMIT %s
            """
            
            # 使用通配符进行模糊匹配
            search_pattern = f"%{clean_keyword}%"
            params = (search_pattern, limit)
            
            results = self.embedding_dao.db.execute_query(query, params)
            
            # 格式化结果，与semantic_search保持一致
            formatted_results = []
            for result in results:
                # 计算匹配度（简单的字符串匹配度）
                raw_input = result.get('document', '')
                match_count = raw_input.lower().count(clean_keyword.lower())
                similarity = min(match_count * 0.1, 1.0)  # 简单的相似度计算
                
                # 解析extracted_json获取元数据
                metadata = {}
                if result.get('extracted_json'):
                    try:
                        import json
                        extracted_data = json.loads(result['extracted_json'])
                        if extracted_data.get('keywords'):
                            metadata['keywords'] = extracted_data['keywords']
                        if extracted_data.get('topics'):
                            metadata['topics'] = extracted_data['topics']
                    except json.JSONDecodeError:
                        pass
                
                formatted_result = {
                    'id': f"literal_{result['event_id']}",
                    'event_id': result['event_id'],
                    'person_name': result['person_name'],
                    'document': result['document'],
                    'metadata': metadata,
                    'embedding_type': 'literal_match',
                    'similarity': similarity,
                    'search_type': 'literal',
                    'matched_keyword': clean_keyword,
                    'timestamp': result.get('timestamp')
                }
                formatted_results.append(formatted_result)
            
            logger.debug(f"Literal search for '{clean_keyword}' found {len(formatted_results)} results")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error in literal search for '{keyword}': {e}")
            return []

    def advanced_search(self, query: str, limit: int = 10, 
                       person_filter: Optional[str] = None) -> Dict:
        """
        高级搜索：显式的智能搜索接口（与semantic_search功能相同，但更明确）
        """
        try:
            # 分类查询意图
            intent = self.classify_query_intent(query)
            
            if intent == 'person':
                # 人名查询：使用语义搜索（已优化人名权重）
                results = self.semantic_search(query, limit, person_filter)
                results['search_strategy'] = 'semantic_person'
                results['detected_intent'] = intent
                
            elif intent == 'keyword':
                # 关键词查询：结合literal和semantic搜索
                literal_results = self.literal_search(query, limit // 2)
                semantic_results = self.semantic_search(query, limit // 2, person_filter)
                
                # 合并结果，literal优先
                combined_results = literal_results + semantic_results.get('results', [])
                # 去重（基于event_id）
                seen_events = set()
                unique_results = []
                for result in combined_results:
                    event_id = result.get('event_id')
                    if event_id and event_id not in seen_events:
                        seen_events.add(event_id)
                        unique_results.append(result)
                
                # 限制结果数量
                unique_results = unique_results[:limit]
                
                results = {
                    'query': query,
                    'results': unique_results,
                    'total_results': len(unique_results),
                    'limit': limit,
                    'person_filter': person_filter,
                    'search_strategy': 'hybrid_keyword',
                    'detected_intent': intent
                }
                
            else:  # semantic
                # 语义查询：使用纯语义搜索
                results = self.semantic_search(query, limit, person_filter)
                results['search_strategy'] = 'semantic_only'
                results['detected_intent'] = intent
            
            return results
            
        except Exception as e:
            logger.error(f"Error in advanced search: {e}")
            return {
                'query': query,
                'results': [],
                'total_results': 0,
                'limit': limit,
                'person_filter': person_filter,
                'search_strategy': 'error',
                'detected_intent': 'unknown',
                'error': str(e)
            }

    def migrate_existing_persons_to_embeddings(self) -> Dict:
        """为现有人员创建人名嵌入（迁移工具）"""
        try:
            from core.dao import PersonDAO
            person_dao = PersonDAO()
            
            # 获取所有现有人员
            all_persons = person_dao.get_all_persons()
            
            success_count = 0
            error_count = 0
            skipped_count = 0
            
            logger.info(f"Starting migration for {len(all_persons)} existing persons")
            
            for person in all_persons:
                person_id = person['id']
                canonical_name = person['canonical_name']
                
                try:
                    # 检查是否已存在人名嵌入
                    existing_embedding = self.embedding_dao.get_embedding_by_id(f"person_name_{person_id}")
                    if existing_embedding:
                        skipped_count += 1
                        logger.debug(f"Skipping {canonical_name} - embedding already exists")
                        continue
                    
                    # 创建人名嵌入
                    success = self.create_person_name_embedding(person_id, canonical_name)
                    if success:
                        success_count += 1
                        logger.debug(f"Created embedding for {canonical_name}")
                    else:
                        error_count += 1
                        logger.warning(f"Failed to create embedding for {canonical_name}")
                        
                except Exception as e:
                    error_count += 1
                    logger.error(f"Error processing person {canonical_name}: {e}")
            
            result = {
                "success": True,
                "total_persons": len(all_persons),
                "success_count": success_count,
                "error_count": error_count,
                "skipped_count": skipped_count,
                "message": f"Migration completed: {success_count} created, {error_count} errors, {skipped_count} skipped"
            }
            
            logger.info(result["message"])
            return result
            
        except Exception as e:
            logger.error(f"Error in person embedding migration: {e}")
            return {
                "success": False,
                "error": str(e),
                "total_persons": 0,
                "success_count": 0,
                "error_count": 0,
                "skipped_count": 0
            }
