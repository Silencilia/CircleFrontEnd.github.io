"""
数据访问对象层 - 纯数据库CRUD操作
"""

from .person_dao import PersonDAO
from .alias_dao import AliasDAO
from .event_dao import EventDAO
from .embedding_dao import EmbeddingDAO

__all__ = [
    'PersonDAO',
    'AliasDAO', 
    'EventDAO',
    'EmbeddingDAO'
]
