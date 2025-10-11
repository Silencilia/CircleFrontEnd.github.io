#!/usr/bin/env python3
"""
迁移脚本：为所有现有person创建人名嵌入
"""
import sys
sys.path.append('.')

from core.services.embedding_service import EmbeddingService

def main():
    print("=" * 60)
    print("Starting person name embeddings migration...")
    print("=" * 60)
    
    try:
        service = EmbeddingService()
        print("EmbeddingService initialized successfully")
        
        print("\nExecuting migration...")
        result = service.migrate_existing_persons_to_embeddings()
        
        print("\n" + "=" * 60)
        print("Migration Result:")
        print("=" * 60)
        for key, value in result.items():
            print(f"{key}: {value}")
            
        if result.get('success'):
            print("\n✅ Migration completed successfully!")
        else:
            print("\n❌ Migration failed!")
            
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
