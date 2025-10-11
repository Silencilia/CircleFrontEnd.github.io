"""
系统管理器 - 基于新分层架构
"""
from typing import Dict
import logging
import os

from core.database import get_db_manager

logger = logging.getLogger(__name__)

class SystemManager:
    """系统管理器 - 处理系统健康检查和统计"""
    
    def __init__(self):
        self.db = get_db_manager()
    
    def check_health(self) -> Dict:
        """检查系统健康状态"""
        status = {
            "database_type": "PostgreSQL",
            "database_url": os.getenv('DATABASE_URL', 'postgresql://localhost/cirkel'),
            "database_ok": False,
            "tables_ok": False,
            "missing_tables": [],
            "pgvector_ok": False
        }
        
        try:
            # 检查数据库连接
            result = self.db.execute_query("SELECT 1")
            status["database_ok"] = True
            
            # 检查表存在性
            expected_tables = {"events", "persons", "person_aliases", "shadow_entities", "embeddings"}
            tables_result = self.db.execute_query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
            existing_tables = {row['tablename'] for row in tables_result}
            
            missing = sorted(list(expected_tables - existing_tables))
            status["tables_ok"] = len(missing) == 0
            status["missing_tables"] = missing
            
            # 检查pgvector扩展
            pgvector_result = self.db.execute_query("SELECT 1 FROM pg_extension WHERE extname = 'vector'")
            status["pgvector_ok"] = len(pgvector_result) > 0
            
            # 整体状态
            if status["database_ok"] and status["tables_ok"] and status["pgvector_ok"]:
                status["overall"] = "healthy"
            elif status["database_ok"]:
                status["overall"] = "degraded"
            else:
                status["overall"] = "unhealthy"
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            status["error"] = str(e)
            status["overall"] = "unhealthy"
        
        return status
    
    def get_stats(self) -> Dict:
        """获取系统统计信息"""
        try:
            stats = {}
            
            # 人员统计
            persons_result = self.db.execute_query("SELECT COUNT(*) as count FROM persons")
            stats["total_people"] = persons_result[0]['count'] if persons_result else 0
            
            # 事件统计
            events_result = self.db.execute_query("SELECT COUNT(*) as count FROM events")
            stats["total_events"] = events_result[0]['count'] if events_result else 0
            
            # Alias统计
            aliases_result = self.db.execute_query("SELECT COUNT(*) as count FROM person_aliases")
            stats["total_aliases"] = aliases_result[0]['count'] if aliases_result else 0
            
            # 嵌入统计
            embeddings_result = self.db.execute_query("SELECT COUNT(*) as count FROM embeddings")
            stats["total_embeddings"] = embeddings_result[0]['count'] if embeddings_result else 0
            
            # 最活跃的人员
            active_people_result = self.db.execute_query("""
                SELECT p.canonical_name, COUNT(e.id) as interaction_count
                FROM persons p
                JOIN events e ON e.person_id = p.id
                GROUP BY p.id, p.canonical_name
                ORDER BY interaction_count DESC
                LIMIT 5
            """)
            
            stats["most_active_people"] = [
                {"name": row['canonical_name'], "interactions": row['interaction_count']}
                for row in active_people_result
            ]
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {"error": str(e)}
    
    def reset_database(self) -> Dict:
        """重置数据库（清空所有数据）"""
        try:
            from core.storage import reset_database
            reset_database()
            return {"success": True}
        except Exception as e:
            logger.error(f"Error resetting database: {e}")
            return {"success": False, "error": str(e)}