"""
数据库层 - 统一的数据库访问接口
"""

from .connection import DatabaseManager, get_db_manager

__all__ = [
    'DatabaseManager',
    'get_db_manager'
]
