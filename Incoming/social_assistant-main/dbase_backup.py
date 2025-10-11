#!/usr/bin/env python3
"""
数据库备份到 iCloud
使用: python backup_db.py
"""

import os
import sys
from datetime import datetime
from pathlib import Path

def backup_database():
    """备份 PostgreSQL 数据库到 iCloud"""
    
    # 检查是否在 Mac
    icloud_path = Path.home() / "Library/Mobile Documents/com~apple~CloudDocs"
    if not icloud_path.exists():
        print("❌ iCloud Drive not found. Are you on Mac?")
        return False
    
    # 创建备份目录
    backup_dir = icloud_path / "Cirkel_Backups"
    backup_dir.mkdir(exist_ok=True)
    print(f"📁 Backup directory: {backup_dir}")
    
    # 生成备份文件名
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"cirkel_{timestamp}.sql"
    
    # 查找 pg_dump
    pg_paths = [
        "/opt/homebrew/opt/postgresql@14/bin/pg_dump",
        "/opt/homebrew/opt/postgresql@15/bin/pg_dump", 
        "/opt/homebrew/opt/postgresql@17/bin/pg_dump",
        "/usr/local/bin/pg_dump",
        "pg_dump"
    ]
    
    pg_dump = None
    for path in pg_paths:
        if os.path.exists(path) or os.system(f"which {path} > /dev/null 2>&1") == 0:
            pg_dump = path
            break
    
    if not pg_dump:
        print("❌ pg_dump not found. Is PostgreSQL installed?")
        return False
    
    print(f"🔧 Using: {pg_dump}")
    print(f"💾 Backing up to: {backup_file}")
    
    # 执行备份 - 包含pgvector扩展
    # 使用 --verbose 和 --clean 确保完整备份，包括扩展
    backup_cmd = f"{pg_dump} --verbose --clean --create --if-exists --extension=vector cirkel"
    print(f"🔄 Running: {backup_cmd}")
    result = os.system(f"{backup_cmd} > '{backup_file}' 2>/dev/null")
    
    if result == 0:
        # 检查文件大小
        size = backup_file.stat().st_size
        if size > 0:
            # 验证备份包含向量数据
            with open(backup_file, 'r') as f:
                content = f.read()
                has_vector_ext = 'CREATE EXTENSION' in content and 'vector' in content
                has_embeddings = 'CREATE TABLE' in content and 'embeddings' in content
                has_vector_data = 'INSERT INTO public.embeddings' in content or ('COPY public.embeddings' in content)
                
                print(f"🔍 Backup validation:")
                print(f"   Vector extension: {'✅' if has_vector_ext else '❌'}")
                print(f"   Embeddings table: {'✅' if has_embeddings else '❌'}")
                print(f"   Vector data: {'✅' if has_vector_data else '⚠️  No data'}")
            
            # 压缩
            os.system(f"gzip '{backup_file}'")
            compressed_size = (backup_file.parent / f"{backup_file.name}.gz").stat().st_size
            print(f"✅ Backup successful!")
            print(f"📊 Size: {compressed_size / 1024:.1f} KB (compressed)")
            print(f"📍 Location: {backup_file}.gz")
            return True
        else:
            backup_file.unlink()
            print("❌ Backup failed: empty file")
            return False
    else:
        if backup_file.exists():
            backup_file.unlink()
        print("❌ Backup failed. Check database name and connection.")
        return False

if __name__ == "__main__":
    success = backup_database()
    sys.exit(0 if success else 1)