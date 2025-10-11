"""
RAG (Retrieval-Augmented Generation) module for semantic search and context retrieval
Complete PostgreSQL + pgvector implementation
"""
import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import json
from typing import List, Dict, Optional
from pathlib import Path
import numpy as np
from datetime import datetime
import logging
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

from core.config import USE_OPENAI_EMBEDDING, EMBEDDING_MODEL, LOCAL_EMBEDDING_MODEL
from openai import OpenAI

# 加载环境变量
load_dotenv()

logger = logging.getLogger(__name__)

# 初始化 OpenAI 客户端
openai_client = None
if USE_OPENAI_EMBEDDING:
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent

# Lazy loading for embedding model
_embedding_model = None

def get_connection():
    """获取PostgreSQL数据库连接"""
    db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/cirkel')
    
    if db_url.startswith('postgresql://') or db_url.startswith('postgres://'):
        import urllib.parse as urlparse
        parsed = urlparse.urlparse(db_url)
        
        return psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],
            user=parsed.username,
            password=parsed.password
        )
    else:
        return psycopg2.connect(
            host='localhost',
            database='cirkel',
            user=os.getenv('DB_USER', 'user'),
            password=os.getenv('DB_PASSWORD', '')
        )

def init_retrieval_system():
    """初始化向量检索系统"""
    global _embedding_model
    
    print("  初始化pgvector检索系统...")
    
    # 检查数据库连接
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # 检查pgvector扩展
        cursor.execute("SELECT 1 FROM pg_extension WHERE extname = 'vector'")
        if not cursor.fetchone():
            print("  警告: pgvector扩展未找到")
        else:
            print("  ✅ pgvector扩展已启用")
        
        # 检查embeddings表
        cursor.execute("SELECT COUNT(*) FROM embeddings")
        count = cursor.fetchone()[0]
        print(f"  ✅ embeddings表已验证，包含 {count} 条记录")
        
        conn.close()
        
    except Exception as e:
        print(f"  ⚠️ 数据库检查失败: {e}")
    
    # 只有在不使用 OpenAI 时才加载本地模型
    if not USE_OPENAI_EMBEDDING:
        if _embedding_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                _embedding_model = SentenceTransformer(LOCAL_EMBEDDING_MODEL)
                _embedding_model.encode("warmup", convert_to_tensor=False)
                print(f"  ✅ 本地嵌入模型已加载: {LOCAL_EMBEDDING_MODEL}")
            except Exception as e:
                print(f"  ❌ 本地嵌入模型加载失败: {e}")
    else:
        print(f"    使用 OpenAI Embedding: {EMBEDDING_MODEL}")
    
    print("  ✅ pgvector检索系统就绪")

def get_embedding_model():
    """获取嵌入模型（延迟加载）"""
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer(LOCAL_EMBEDDING_MODEL)
    return _embedding_model

def generate_embedding(text: str) -> List[float]:
    """生成文本嵌入"""
    if USE_OPENAI_EMBEDDING and openai_client:
        try:
            response = openai_client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"[WARNING] OpenAI embedding failed: {e}, falling back to local")
    
    # 使用本地模型
    model = get_embedding_model()
    embedding = model.encode(text, convert_to_tensor=False)
    return embedding.tolist()

def index_event(event_id: int, person_name: str, raw_input: str, extracted_json: str = None):
    """将事件索引到pgvector数据库"""
    try:
        # 创建增强文档
        document = _create_enriched_document(person_name, raw_input, extracted_json)
        
        # 生成嵌入
        embedding = generate_embedding(document)
        
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
        
        # 存储到pgvector
        _store_embedding(
            doc_id=f"event_{event_id}",
            event_id=event_id,
            person_name=person_name,
            embedding=embedding,
            document=raw_input,  # 保存原始文本用于显示
            metadata=metadata,
            embedding_type="interaction"
        )
        
        logger.debug(f"Indexed event {event_id} for {person_name}")
        
    except Exception as e:
        logger.error(f"Error indexing event {event_id}: {e}")

def _create_enriched_document(person_name: str, raw_input: str, extracted_json: str = None) -> str:
    """创建增强文档文本以提高搜索效果"""
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

def _store_embedding(doc_id: str, event_id: int, person_name: str, embedding: List[float], 
                    document: str, metadata: dict, embedding_type: str = "interaction"):
    """存储嵌入到pgvector数据库"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # 使用pgvector存储
        query = """
        INSERT INTO embeddings (id, event_id, person_name, embedding, document, metadata, embedding_type)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            embedding = EXCLUDED.embedding,
            document = EXCLUDED.document,
            metadata = EXCLUDED.metadata,
            created_at = CURRENT_TIMESTAMP
        """
        
        params = (
            doc_id,
            event_id,
            person_name,
            str(embedding),  # pgvector会解析这个
            document,
            json.dumps(metadata),
            embedding_type
        )
        
        cursor.execute(query, params)
        conn.commit()
        
    finally:
        conn.close()

def semantic_search(query: str, limit: int = 10, person_filter: Optional[str] = None, 
                   person_name: Optional[str] = None, top_k: Optional[int] = None):
    """使用pgvector进行语义搜索"""
    try:
        # 处理参数兼容性
        if person_name and not person_filter:
            person_filter = person_name
        
        # 确定是否是遗留调用（使用top_k参数）
        is_legacy_call = top_k is not None
        
        if top_k:
            limit = top_k
            
        # 生成查询嵌入
        query_embedding = generate_embedding(query)
        
        conn = get_connection()
        try:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            # 使用pgvector相似度搜索
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
            ORDER BY embedding <-> %s::vector
            LIMIT %s
            """
            params.extend([str(query_embedding), limit])
            
            cursor.execute(base_query, params)
            rows = cursor.fetchall()
            
            # 格式化结果
            results = []
            for row in rows:
                try:
                    metadata = json.loads(row['metadata']) if isinstance(row['metadata'], str) else row['metadata']
                except json.JSONDecodeError:
                    metadata = {}
                
                result = {
                    'id': row['id'],
                    'event_id': row['event_id'],
                    'person_name': row['person_name'],
                    'document': row['document'],
                    'metadata': metadata,
                    'embedding_type': row['embedding_type'],
                    'similarity': 1.0 - row['distance'],  # 转换距离为相似度
                    'distance': row['distance']
                }
                results.append(result)
            
        finally:
            conn.close()
        
        # 向后兼容性：如果使用遗留参数，返回结果列表
        if is_legacy_call:
            return results
        
        return {
            'query': query,
            'results': results,
            'total_results': len(results),
            'limit': limit,
            'person_filter': person_filter
        }
        
    except Exception as e:
        logger.error(f"Error in semantic search: {e}")
        
        # 向后兼容性错误处理
        if top_k is not None:
            return []
        
        return {
            'query': query,
            'results': [],
            'total_results': 0,
            'limit': limit,
            'person_filter': person_filter,
            'error': str(e)
        }

def search_relationships(query: str, top_k: int = 5):
    """搜索人员关系（使用pgvector）"""
    try:
        # 使用语义搜索查找关系类型的嵌入
        search_results = semantic_search(query, limit=top_k)
        
        # 如果是遗留调用，search_results已经是列表
        if isinstance(search_results, list):
            results = search_results
        else:
            results = search_results.get('results', [])
        
        # 过滤关系类型的嵌入并格式化结果
        formatted_results = []
        for result in results:
            if result.get('embedding_type') == 'relationship':
                metadata = result.get('metadata', {})
                formatted_results.append({
                    'document': result.get('document', ''),
                    'metadata': metadata,
                    'similarity': result.get('similarity', 0.0),
                    'person': metadata.get('primary_person'),
                    'mentioned': metadata.get('related_people', [])
                })
        
        return formatted_results
        
    except Exception as e:
        logger.error(f"Error searching relationships: {e}")
        return []

def index_person_relationships(event_id: int, person_name: str, extracted_json: str):
    """索引人员关系信息到pgvector"""
    if not extracted_json:
        return
        
    try:
        extracted = json.loads(extracted_json)
        people_mentioned = extracted.get('people_mentioned', [])
        
        if people_mentioned:
            # 构建关系文本
            relationships = []
            for p in people_mentioned:
                # 跳过自己
                if p['name'] == person_name:
                    continue
                rel_text = f"{person_name} knows {p['name']}"
                if p.get('relationship'):
                    rel_text += f" (relationship: {p['relationship']})"
                if p.get('context'):
                    rel_text += f" - {p['context']}"
                relationships.append(rel_text)
            
            # 为每个关系创建嵌入
            for i, rel in enumerate(relationships):
                embedding = generate_embedding(rel)
                
                metadata = {
                    "event_id": event_id,
                    "primary_person": person_name,
                    "mentioned_person": people_mentioned[i]['name'],
                    "relationship_type": "mentioned_together",
                    "timestamp": datetime.now().isoformat()
                }
                
                _store_embedding(
                    doc_id=f"relationship_{event_id}_{i}",
                    event_id=event_id,
                    person_name=person_name,
                    embedding=embedding,
                    document=rel,
                    metadata=metadata,
                    embedding_type="relationship"
                )
                
    except Exception as e:
        logger.error(f"Error indexing person relationships for event {event_id}: {e}")

def get_person_context(person_name: str, include_related: bool = True) -> Dict:
    """获取人员的综合上下文信息"""
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # 获取人员的所有事件
        cursor.execute("""
            SELECT id, timestamp, raw_input, extracted_json 
            FROM events 
            WHERE person_name = %s
            ORDER BY timestamp DESC
            LIMIT 20
        """, (person_name,))
        
        events = cursor.fetchall()
        
        context = {
            'person': person_name,
            'events': [],
            'facts': [],
            'people_mentioned': [],
            'commitments': [],
            'topics': set()
        }
        
        for event in events:
            context['events'].append({
                'id': event['id'],
                'timestamp': event['timestamp'],
                'raw_input': event['raw_input']
            })
            
            # 解析提取的数据
            if event['extracted_json']:
                try:
                    extracted = json.loads(event['extracted_json'])
                    
                    # 收集事实
                    if extracted.get('facts'):
                        for fact in extracted['facts']:
                            context['facts'].append({
                                'fact': fact['fact'],
                                'confidence': fact.get('confidence', 0.5),
                                'source_event': event['id']
                            })
                    
                    # 收集提到的人员
                    if extracted.get('people_mentioned'):
                        for person in extracted['people_mentioned']:
                            context['people_mentioned'].append({
                                'name': person['name'],
                                'context': person.get('context', ''),
                                'source_event': event['id']
                            })
                    
                    # 收集承诺
                    if extracted.get('commitments'):
                        for commitment in extracted['commitments']:
                            context['commitments'].append({
                                'commitment': commitment['commitment'],
                                'by_whom': commitment.get('by_whom', 'unknown'),
                                'deadline': commitment.get('deadline'),
                                'source_event': event['id']
                            })
                    
                    # 收集主题
                    if extracted.get('topics'):
                        context['topics'].update(extracted['topics'])
                except:
                    pass
        
        conn.close()
        
        context['topics'] = list(context['topics'])
        return context
        
    except Exception as e:
        logger.error(f"Error getting person context for {person_name}: {e}")
        return {
            'person': person_name,
            'events': [],
            'facts': [],
            'people_mentioned': [],
            'commitments': [],
            'topics': [],
            'error': str(e)
        }

def reindex_all_events():
    """重新索引所有事件到pgvector"""
    conn = None
    try:
        logger.info("Starting to reindex all events to pgvector...")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # 清除现有嵌入 - 在事务中执行
        cursor.execute("DELETE FROM embeddings")
        conn.commit()  # 立即提交DELETE操作
        logger.info("Cleared existing embeddings")
        
        # 获取所有事件
        cursor.execute("""
            SELECT id, person_name, raw_input, extracted_json
            FROM events
            ORDER BY id
        """)
        
        events = cursor.fetchall()
        total_events = len(events)
        logger.info(f"Found {total_events} events to reindex")
        
        success_count = 0
        error_count = 0
        
        for i, event in enumerate(events):
            try:
                event_id, person_name, raw_input, extracted_json = event
                
                # 索引事件
                index_event(event_id, person_name, raw_input, extracted_json)
                
                # 索引关系（如果有）
                if extracted_json:
                    index_person_relationships(event_id, person_name, extracted_json)
                
                success_count += 1
                
                # 进度日志
                if (i + 1) % 100 == 0:
                    logger.info(f"Reindexing {i + 1}/{total_events} events")
                    
            except Exception as e:
                error_count += 1
                logger.error(f"Error reindexing event {event[0]}: {e}")
        
        conn.commit()  # 提交所有更改
        conn.close()
        
        logger.info(f"Reindexing completed: {success_count} success, {error_count} errors")
        
        return {
            "success": True,
            "total_events": total_events,
            "success_count": success_count,
            "error_count": error_count
        }
        
    except Exception as e:
        logger.error(f"Error reindexing events: {e}")
        if conn:
            try:
                conn.rollback()  # 出错时回滚
                conn.close()
            except:
                pass
        return {
            "success": False,
            "error": str(e)
        }

def build_rag_prompt(query: str, context: Dict) -> str:
    """为LLM构建包含检索上下文的提示"""
    
    prompt = f"""based on the following information about {context['person']}, answer the query.

    Known facts (with confidence):"""
    
    # 首先添加高置信度事实
    high_conf_facts = [f for f in context['facts'] if f['confidence'] > 0.8]
    for fact in high_conf_facts[:5]:  # 限制以避免上下文溢出
        prompt += f"- {fact['fact']} (confidence: {fact['confidence']:.1f})\n"
    
    if context['commitments']:
        prompt += "\ncommitments:\n"
        for commitment in context['commitments'][:3]:
            who = "you" if commitment['by_whom'] == 'me' else "they"
            prompt += f"- {who} commitment: {commitment['commitment']}"
            if commitment.get('deadline'):
                prompt += f" (deadline {commitment['deadline']})"
            prompt += "\n"
    
    if context['people_mentioned']:
        prompt += "\ntheir network:\n"
        for person in context['people_mentioned'][:5]:
            prompt += f"- {person['name']}: {person['context']}\n"
    
    if context['topics']:
        prompt += f"\ntopics discussed: {', '.join(context['topics'][:10])}\n"
    
    prompt += f"""

            query: {query}

            important notes:
            - 仅使用上述上下文信息
            - distinguish facts (high confidence) from inferences (low confidence)
            - if information is not available, please clearly state it
            - be helpful but do not fabricate information

            response:
            """
    
    return prompt

# 导出主要函数
__all__ = [
    'init_retrieval_system',
    'get_embedding_model', 
    'generate_embedding',
    'index_event',
    'semantic_search',
    'index_person_relationships',
    'reindex_all_events',
    'get_person_context',
    'search_relationships',
    'build_rag_prompt'
]
