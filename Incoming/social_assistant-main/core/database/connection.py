"""
数据库连接管理 - 唯一的数据库访问点
"""
import os
import psycopg2
import psycopg2.extras
from typing import Optional, Any, List, Dict
from contextlib import contextmanager
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class DatabaseManager:
    """统一的数据库管理器"""
    
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/cirkel')
        self._connection_params = self._parse_url()
    
    def _parse_url(self) -> dict:
        """解析数据库URL"""
        if self.db_url.startswith('postgresql://') or self.db_url.startswith('postgres://'):
            import urllib.parse as urlparse
            parsed = urlparse.urlparse(self.db_url)
            
            return {
                'host': parsed.hostname,
                'port': parsed.port or 5432,
                'database': parsed.path[1:],  # Remove leading /
                'user': parsed.username,
                'password': parsed.password
            }
        else:
            return {
                'host': 'localhost',
                'database': 'cirkel',
                'user': os.getenv('DB_USER', 'user'),
                'password': os.getenv('DB_PASSWORD', '')
            }
    
    @contextmanager
    def get_connection(self):
        """获取数据库连接（上下文管理器）"""
        conn = None
        try:
            conn = psycopg2.connect(**self._connection_params)
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database connection error: {e}")
            raise
        finally:
            if conn:
                conn.close()
    
    @contextmanager
    def get_cursor(self, dict_cursor=True):
        """获取数据库游标（上下文管理器）"""
        with self.get_connection() as conn:
            if dict_cursor:
                cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            else:
                cursor = conn.cursor()
            try:
                yield cursor, conn
            finally:
                cursor.close()
    
    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict]:
        """执行查询并返回结果"""
        with self.get_cursor() as (cursor, conn):
            cursor.execute(query, params)
            if query.strip().upper().startswith('SELECT'):
                return [dict(row) for row in cursor.fetchall()]
            else:
                conn.commit()
                return []
    
    def execute_insert(self, query: str, params: Optional[tuple] = None) -> Optional[int]:
        """执行INSERT并返回ID"""
        with self.get_cursor() as (cursor, conn):
            cursor.execute(query, params)
            conn.commit()
            try:
                result = cursor.fetchone()
                if result:
                    # 处理字典格式的结果（RealDictCursor）
                    if isinstance(result, dict):
                        # 返回第一个值（通常是ID）
                        return list(result.values())[0]
                    else:
                        return result[0]
                return cursor.rowcount
            except (TypeError, IndexError):
                return cursor.rowcount

# 全局数据库管理器实例
_db_manager = None

def get_db_manager() -> DatabaseManager:
    """获取数据库管理器实例 - 测试环境使用独立实例"""
    global _db_manager
    
    # 在测试环境中，每次返回新实例避免连接共享
    if os.getenv('TESTING'):
        return DatabaseManager()
    
    # 生产环境使用单例
    if _db_manager is None:
        _db_manager = DatabaseManager()
    return _db_manager
