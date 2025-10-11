"""
数据库工具 - 连接管理和死锁检测
"""
import time
import logging
from core.database import get_db_manager

logger = logging.getLogger(__name__)

def check_and_kill_blocking_locks():
    """检查并终止阻塞的锁"""
    try:
        db = get_db_manager()
        
        # 查找未授予的锁
        blocking_locks = db.execute_query("""
            SELECT l.pid, l.locktype, l.mode, l.granted, a.query_start
            FROM pg_locks l
            JOIN pg_stat_activity a ON l.pid = a.pid
            WHERE NOT l.granted
            AND a.query_start < NOW() - INTERVAL '30 seconds'
        """)
        
        for lock in blocking_locks:
            logger.warning(f"Terminating blocking process {lock['pid']}")
            db.execute_query(f"SELECT pg_terminate_backend({lock['pid']})")
            
        return len(blocking_locks)
        
    except Exception as e:
        logger.error(f"Error checking locks: {e}")
        return 0

def safe_init_db():
    """安全的数据库初始化"""
    try:
        # 先清理可能的死锁
        killed = check_and_kill_blocking_locks()
        if killed > 0:
            logger.info(f"Killed {killed} blocking processes")
            time.sleep(1)  # 等待清理完成
        
        # 执行初始化
        from core.storage import init_db
        init_db()
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # 再次尝试清理
        check_and_kill_blocking_locks()
        raise

def optimize_postgres_for_vectors():
    """为向量操作优化PostgreSQL设置"""
    try:
        db = get_db_manager()
        
        # 临时提高维护工作内存
        db.execute_query("SET maintenance_work_mem = '512MB'")
        db.execute_query("SET max_parallel_maintenance_workers = 2")
        
        logger.info("PostgreSQL optimized for vector operations")
        
    except Exception as e:
        logger.warning(f"Could not optimize PostgreSQL settings: {e}")
