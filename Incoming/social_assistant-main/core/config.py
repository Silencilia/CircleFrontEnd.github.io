"""
Global configuration for social assistant (全局配置)

Centralized configuration management for API keys, model settings, etc.
"""

import os
from dotenv import load_dotenv

load_dotenv()


EXTRACTION_MODEL =  "gpt-4o-mini"# 信息提取用的模型
SUGGESTION_MODEL = "gpt-4o-mini" # 建议生成用的模型
EMBEDDING_MODEL = "text-embedding-3-small" # OpenAI embedding模型

# Embedding settings
USE_OPENAI_EMBEDDING = os.getenv("USE_OPENAI_EMBEDDING", "true").lower() == "true"
LOCAL_EMBEDDING_MODEL = os.getenv("LOCAL_EMBEDDING_MODEL", "all-MiniLM-L6-v2")  # 备用


DEFAULT_SEARCH_LIMIT = int(os.getenv("DEFAULT_SEARCH_LIMIT", "5"))
DAYS_BEFORE_RECONNECT = int(os.getenv("DAYS_BEFORE_RECONNECT", "30"))