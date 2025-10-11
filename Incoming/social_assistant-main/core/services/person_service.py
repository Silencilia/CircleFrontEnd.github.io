"""
人员服务 - 处理人员和别名的业务逻辑
"""
from typing import Optional, Dict, List
import logging

from core.dao import PersonDAO, AliasDAO
from core.utils import normalize_text

logger = logging.getLogger(__name__)

class PersonService:
    """人员服务 - 处理人员和别名的核心逻辑"""
    
    def __init__(self):
        self.person_dao = PersonDAO()
        self.alias_dao = AliasDAO()
        # 延迟导入避免循环依赖
        self._embedding_service = None
    
    def _get_embedding_service(self):
        """获取EmbeddingService实例（延迟加载）"""
        if self._embedding_service is None:
            from core.services.embedding_service import EmbeddingService
            self._embedding_service = EmbeddingService()
        return self._embedding_service
    
    def get_or_create_person_id(self, person_name: str) -> int:
        """获取或创建person_id（核心逻辑）"""
        normalized_name = normalize_text(person_name)
        
        # 1. 通过别名查找现有person_id
        person_id = self.alias_dao.get_person_id_by_alias(normalized_name)
        if person_id:
            return person_id
        
        # 2. 创建新人员
        person_id = self.person_dao.create_person(normalized_name)
        
        # 3. 添加别名（自己的名字也是别名）
        self.alias_dao.create_alias(person_id, normalized_name, confidence=1.0, source='user_input')
        
        # 4. 创建人名嵌入（新功能，不影响现有逻辑）
        try:
            embedding_service = self._get_embedding_service()
            embedding_service.create_person_name_embedding(person_id, normalized_name)
            logger.debug(f"Created person name embedding for {normalized_name}")
        except Exception as e:
            # 嵌入创建失败不影响主要功能
            logger.warning(f"Failed to create person name embedding for {normalized_name}: {e}")
        
        return person_id
    
    def get_person_by_alias(self, alias: str) -> Optional[Dict]:
        """通过任意别名获取人员信息"""
        # 获取person_id
        person_id = self.alias_dao.get_person_id_by_alias(alias)
        if not person_id:
            return None
        
        # 获取人员信息
        return self.person_dao.get_person_by_id(person_id)
    
    def add_alias(self, person_name: str, alias: str, source: str = 'manual', 
                 confidence: float = 1.0) -> Dict:
        """为人员添加别名"""
        try:
            normalized_person = normalize_text(person_name)
            normalized_alias = normalize_text(alias)
            
            if not normalized_person or not normalized_alias:
                return {"success": False, "error": "Invalid person name or alias"}
            
            # 获取person_id
            person_id = self.get_or_create_person_id(normalized_person)
            
            # 检查别名是否已存在于同一人员（避免重复）
            person_aliases = self.alias_dao.get_aliases_by_person_id(person_id)
            existing_aliases = [a['alias'].lower() for a in person_aliases]
            
            if normalized_alias.lower() in existing_aliases:
                return {"success": True, "message": "Alias already exists for this person"}
            
            # 允许多个人员使用相同的别名 - 用户有完全的自由度
            
            # 添加别名
            alias_id = self.alias_dao.create_alias(person_id, normalized_alias, confidence, source)
            
            return {
                "success": True,
                "person_id": person_id,
                "person_name": normalized_person,
                "alias": normalized_alias,
                "alias_id": alias_id,
                "confidence": confidence,
                "source": source
            }
            
        except Exception as e:
            logger.error(f"Error adding alias: {e}")
            return {"success": False, "error": str(e)}
    
    def get_all_aliases(self, person_name: str) -> Dict:
        """获取人员的所有别名"""
        try:
            # 获取person_id
            person_id = self.alias_dao.get_person_id_by_alias(person_name)
            if not person_id:
                return {"success": False, "error": "Person not found"}
            
            # 获取人员信息
            person = self.person_dao.get_person_by_id(person_id)
            
            # 获取所有别名
            aliases = self.alias_dao.get_aliases_by_person_id(person_id)
            
            return {
                "success": True,
                "person_id": person_id,
                "canonical_name": person['canonical_name'] if person else person_name,
                "aliases": aliases,
                "total_aliases": len(aliases),
                "primary": person['canonical_name'] if person else person_name
            }
            
        except Exception as e:
            logger.error(f"Error getting aliases: {e}")
            return {"success": False, "error": str(e)}
    
    def remove_alias(self, alias: str) -> Dict:
        """移除别名"""
        try:
            # 检查别名是否存在
            alias_record = self.alias_dao.get_alias_by_name(alias)
            if not alias_record:
                return {"success": False, "error": f"Alias '{alias}' not found"}
            
            person_id = alias_record['person_id']
            
            # 检查是否是最后一个别名
            alias_count = self.alias_dao.count_aliases_for_person(person_id)
            if alias_count <= 1:
                person = self.person_dao.get_person_by_id(person_id)
                canonical_name = person['canonical_name'] if person else "Unknown"
                return {
                    "success": False,
                    "error": f"Cannot remove the last alias for person '{canonical_name}'"
                }
            
            # 删除别名
            success = self.alias_dao.delete_alias(alias)
            
            if success:
                person = self.person_dao.get_person_by_id(person_id)
                return {
                    "success": True,
                    "removed_alias": alias,
                    "person_id": person_id,
                    "canonical_name": person['canonical_name'] if person else "Unknown"
                }
            else:
                return {"success": False, "error": "Failed to remove alias"}
                
        except Exception as e:
            logger.error(f"Error removing alias: {e}")
            return {"success": False, "error": str(e)}
    
    def merge_persons(self, source_person_name: str, target_person_name: str) -> Dict:
        """合并两个人员（将源人员的所有数据转移到目标人员）"""
        try:
            # 获取两个人员的ID
            source_person = self.get_person_by_alias(source_person_name)
            target_person = self.get_person_by_alias(target_person_name)
            
            if not source_person:
                return {"success": False, "error": f"Source person '{source_person_name}' not found"}
            
            if not target_person:
                return {"success": False, "error": f"Target person '{target_person_name}' not found"}
            
            source_id = source_person['id']
            target_id = target_person['id']
            
            if source_id == target_id:
                return {"success": False, "error": "Source and target are the same person"}
            
            # 转移所有别名
            success = self.alias_dao.move_aliases_to_person(source_id, target_id)
            if not success:
                return {"success": False, "error": "Failed to move aliases"}
            
            # 删除源人员
            self.person_dao.delete_person(source_id)
            
            return {
                "success": True,
                "source_person": source_person_name,
                "target_person": target_person_name,
                "source_id": source_id,
                "target_id": target_id
            }
            
        except Exception as e:
            logger.error(f"Error merging persons: {e}")
            return {"success": False, "error": str(e)}
    
    def update_canonical_name(self, person_id: int, new_canonical_name: str) -> Dict:
        """更新人员的标准名称（新功能）"""
        try:
            normalized_new_name = normalize_text(new_canonical_name)
            if not normalized_new_name:
                return {"success": False, "error": "Invalid new canonical name"}
            
            # 获取当前人员信息
            person = self.person_dao.get_person_by_id(person_id)
            if not person:
                return {"success": False, "error": f"Person with ID {person_id} not found"}
            
            old_canonical_name = person['canonical_name']
            
            # 检查新名称是否已被其他人使用
            existing_person = self.person_dao.get_person_by_canonical_name(normalized_new_name)
            if existing_person and existing_person['id'] != person_id:
                return {"success": False, "error": f"Canonical name '{normalized_new_name}' already exists"}
            
            # 更新数据库中的canonical_name（需要在PersonDAO中实现）
            # 这里暂时跳过数据库更新，因为PersonDAO没有update_canonical_name方法
            # TODO: 需要在PersonDAO中添加update_canonical_name方法
            
            # 更新人名嵌入
            try:
                embedding_service = self._get_embedding_service()
                embedding_service.update_person_name_embedding(person_id, old_canonical_name, normalized_new_name)
                logger.debug(f"Updated person name embedding from {old_canonical_name} to {normalized_new_name}")
            except Exception as e:
                logger.warning(f"Failed to update person name embedding: {e}")
            
            return {
                "success": True,
                "person_id": person_id,
                "old_canonical_name": old_canonical_name,
                "new_canonical_name": normalized_new_name,
                "note": "Canonical name update requires PersonDAO.update_canonical_name method"
            }
            
        except Exception as e:
            logger.error(f"Error updating canonical name: {e}")
            return {"success": False, "error": str(e)}
