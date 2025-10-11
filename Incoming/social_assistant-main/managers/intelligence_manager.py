"""
智能管理器 - 基于新分层架构
"""
from typing import Dict, List
import logging
from datetime import datetime, timedelta

from core.services import PersonService, EventService
from core.suggestions import generate_meeting_suggestions

logger = logging.getLogger(__name__)

class IntelligenceManager:
    """智能管理器 - 处理智能分析和提醒"""
    
    def __init__(self):
        self.person_service = PersonService()
        self.event_service = EventService()
    
    def get_reminders(self) -> Dict:
        """获取提醒信息"""
        try:
            # 获取最近的事件来分析承诺和重新联系需求
            recent_events = self.event_service.get_recent_events(50)
            
            commitments = []
            reconnect_candidates = []
            
            # 分析事件
            for event in recent_events:
                if event.get('extracted_json'):
                    try:
                        import json
                        extracted = json.loads(event['extracted_json'])
                        
                        # 收集承诺
                        if extracted.get('commitments'):
                            for commitment in extracted['commitments']:
                                commitments.append({
                                    'commitment': commitment.get('commitment', ''),
                                    'by_whom': commitment.get('by_whom', ''),
                                    'deadline': commitment.get('deadline', ''),
                                    'person': event['person_name'],
                                    'event_id': event['id'],
                                    'timestamp': event['timestamp']
                                })
                        
                        # 分析重新联系需求（超过30天没联系的人）
                        timestamp = event['timestamp']
                        if isinstance(timestamp, str):
                            # 处理字符串时间戳
                            event_date = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                        else:
                            # 处理datetime对象
                            event_date = timestamp
                        
                        days_ago = (datetime.now() - event_date).days
                        
                        if days_ago > 30:
                            # 提取主题作为联系背景
                            topics = extracted.get('topics', []) + extracted.get('keywords', [])
                            if not topics and event['raw_input']:
                                # 如果没有提取的主题，使用原文前50字符
                                topics = [event['raw_input'][:50] + "..."]
                            
                            reconnect_candidates.append({
                                'person': event['person_name'],
                                'days_ago': days_ago,
                                'topics': topics[:3],  # 最多3个主题
                                'urgency': 'high' if days_ago > 60 else 'medium',
                                'last_interaction': event['raw_input'][:100]
                            })
                            
                    except json.JSONDecodeError:
                        pass
            
            # 去重重新联系候选人（按person_name）
            unique_reconnect = {}
            for candidate in reconnect_candidates:
                person = candidate['person']
                if person not in unique_reconnect or candidate['days_ago'] < unique_reconnect[person]['days_ago']:
                    unique_reconnect[person] = candidate
            
            return {
                "commitments": commitments[:10],  # 最多10个承诺
                "reconnect": list(unique_reconnect.values())[:10]  # 最多10个重新联系建议
            }
            
        except Exception as e:
            logger.error(f"Error getting reminders: {e}")
            return {
                "commitments": [],
                "reconnect": [],
                "error": str(e)
            }
    
    def prep_meeting(self, person_name: str) -> Dict:
        """准备会议信息"""
        try:
            # 获取人员的上下文信息
            person_info = self.person_service.get_person_by_alias(person_name)
            if not person_info:
                return {"error": "Person not found"}
            
            # 获取最近的交互
            events = self.event_service.get_person_events(person_name, limit=10)
            
            # 分析交互内容
            facts = []
            topics = set()
            people_mentioned = []
            
            for event in events:
                if event.get('extracted_json'):
                    try:
                        import json
                        extracted = json.loads(event['extracted_json'])
                        
                        # 收集事实
                        if extracted.get('facts'):
                            facts.extend([f['fact'] for f in extracted['facts']])
                        
                        # 收集主题
                        if extracted.get('topics'):
                            topics.update(extracted['topics'])
                        if extracted.get('keywords'):
                            topics.update(extracted['keywords'])
                        
                        # 收集提到的人员
                        if extracted.get('people_mentioned'):
                            people_mentioned.extend([p['name'] for p in extracted['people_mentioned']])
                            
                    except json.JSONDecodeError:
                        pass
            
            # 准备调用 generate_meeting_suggestions 所需的数据
            facts_dicts = [{"fact": fact} for fact in facts]
            commitments_dicts = []  # TODO: 从事件中提取承诺
            
            # 调用 AI 生成建议
            ai_suggestions = generate_meeting_suggestions(
                person_name=person_name,
                events_count=len(events),
                facts=facts_dicts,
                topics=list(topics),
                people_network=list(set(people_mentioned)),
                my_commitments=commitments_dicts
            )
            
            return {
                "person": person_name,
                "canonical_name": person_info['canonical_name'],
                "total_interactions": len(events),
                "facts": facts[:5],  # 前端期望的字段名
                "topics": list(topics)[:10],
                "network": list(set(people_mentioned))[:10],
                "my_commitments": commitments_dicts,  # 前端期望的字段
                "ai_suggestions": ai_suggestions or "• Review past conversations\n• Prepare key talking points\n• Set clear meeting objectives",
                "last_interaction": events[0]['timestamp'] if events else None
            }
            
        except Exception as e:
            logger.error(f"Error preparing meeting: {e}")
            return {"error": str(e)}
    
    def prepare_meeting(self, person_name: str) -> Dict:
        """准备会议信息（API兼容性）"""
        return self.prep_meeting(person_name)