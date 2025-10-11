"""
测试专用数据库管理器 - 解决测试卡死问题
"""
import os
import logging
from contextlib import contextmanager
from core.database import get_db_manager

logger = logging.getLogger(__name__)

class TestDatabaseManager:
    """测试数据库管理器 - 避免死锁和连接泄漏"""
    
    @staticmethod
    def setup_test_db():
        """设置测试数据库 - 禁用向量索引"""
        if not os.getenv('TESTING'):
            raise RuntimeError("This should only be called in test environment")
        
        db = get_db_manager()
        
        # 删除可能导致卡死的向量索引
        try:
            db.execute_query("DROP INDEX IF EXISTS embeddings_vector_idx")
            logger.info("Dropped vector index for testing")
        except Exception as e:
            logger.warning(f"Could not drop vector index: {e}")
        
        # 清理可能的孤儿事务
        try:
            db.execute_query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND pid != pg_backend_pid()")
            logger.info("Cleaned up idle transactions")
        except Exception as e:
            logger.warning(f"Could not clean up transactions: {e}")
    
    @staticmethod
    @contextmanager
    def test_transaction():
        """测试事务上下文管理器 - 确保正确回滚"""
        db = get_db_manager()
        try:
            db.execute_query("BEGIN")
            yield db
        except Exception as e:
            logger.error(f"Test transaction error: {e}")
            db.execute_query("ROLLBACK")
            raise
        finally:
            try:
                db.execute_query("ROLLBACK")
            except:
                pass
    
    @staticmethod
    def cleanup_test_data():
        """清理测试数据"""
        db = get_db_manager()
        tables = ['embeddings', 'person_aliases', 'persons', 'shadow_entities', 'events']
        
        for table in tables:
            try:
                db.execute_query(f"DELETE FROM {table}")
                logger.debug(f"Cleaned table {table}")
            except Exception as e:
                logger.warning(f"Could not clean table {table}: {e}")
