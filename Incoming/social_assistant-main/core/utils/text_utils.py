"""
文本处理工具函数
"""
from typing import Optional, List
import re

def normalize_text(value: Optional[str]) -> str:
    """标准化文本：去除多余空格，处理None值"""
    if not value:
        return ""
    # 去除首尾空格并将多个空格合并为单个空格
    collapsed = " ".join(value.split())
    return collapsed

def extract_last_surname(parts: List[str]) -> str:
    """从姓名部分提取可能的姓氏，跳过常见后缀"""
    if not parts:
        return ""
    suffixes = {"jr", "jr.", "sr", "sr.", "ii", "iii", "iv", "v"}
    # 从末尾开始查找非后缀的词
    for token in reversed(parts):
        token_clean = token.strip().strip(",.").lower()
        if token_clean and token_clean not in suffixes:
            return token_clean
    return ""

def clean_name_for_search(name: str) -> str:
    """清理姓名用于搜索匹配"""
    if not name:
        return ""
    # 移除特殊字符，标准化空格
    cleaned = re.sub(r'[^\w\s]', '', name)
    return normalize_text(cleaned).lower()

def split_name_parts(name: str) -> List[str]:
    """将姓名分割为部分"""
    if not name:
        return []
    # 分割并过滤空字符串
    parts = [part.strip() for part in name.split() if part.strip()]
    return parts

def is_likely_nickname(short_name: str, full_name: str) -> bool:
    """判断短名是否可能是全名的昵称"""
    if not short_name or not full_name:
        return False
    
    short_lower = short_name.lower()
    full_lower = full_name.lower()
    
    # 检查是否是名字的开头
    full_parts = split_name_parts(full_lower)
    if full_parts and full_parts[0].startswith(short_lower):
        return True
    
    # 检查是否包含在任何部分中
    return any(part.startswith(short_lower) for part in full_parts)

def calculate_name_similarity(name1: str, name2: str) -> float:
    """计算两个姓名的相似度"""
    from difflib import SequenceMatcher
    
    if not name1 or not name2:
        return 0.0
    
    # 标准化后比较
    clean1 = clean_name_for_search(name1)
    clean2 = clean_name_for_search(name2)
    
    return SequenceMatcher(None, clean1, clean2).ratio()
