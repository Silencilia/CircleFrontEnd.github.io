import time
import sys

import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test import times
start = time.time()
from core.storage import init_db
print(f"Import storage: {time.time() - start:.2f}s")

start = time.time()
from commands.interactions import add_interaction
print(f"Import interactions: {time.time() - start:.2f}s")

start = time.time()
from core.extraction import extract_information
print(f"Import extraction: {time.time() - start:.2f}s")

start = time.time()
from core.retrieval import semantic_search
print(f"Import retrieval: {time.time() - start:.2f}s")

# Test init_db
start = time.time()
init_db()
print(f"Init DB: {time.time() - start:.2f}s")

# Test actual command speed
print("\n--- Actual Usage Speed ---")
start = time.time()
import social
print(f"Import social.py: {time.time() - start:.2f}s")

print("\n--- Breakdown of retrieval import ---")
start = time.time()
import chromadb
print(f"  chromadb alone: {time.time() - start:.2f}s")

start = time.time()
from sentence_transformers import SentenceTransformer
print(f"  sentence_transformers alone: {time.time() - start:.2f}s")

# 测试是否已经创建了ChromaDB
import os
if os.path.exists("../chroma_db"):
    print("ChromaDB directory exists")
    # 检查目录大小
    import subprocess
    result = subprocess.run(["du", "-sh", "../chroma_db"], capture_output=True, text=True)
    print(f"ChromaDB size: {result.stdout.strip()}")