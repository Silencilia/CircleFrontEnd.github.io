"""
AI-powered suggestion generation for social assistant (AI建议生成)

Functions for generating contextual suggestions and insights using LLMs.
"""
from core.config import SUGGESTION_MODEL
from openai import OpenAI
import os
from typing import Dict, List, Optional
import instructor


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

current_model = SUGGESTION_MODEL

def generate_meeting_suggestions(
    person_name: str,
    events_count: int,
    facts: List[Dict],
    topics: List[str],
    people_network: List[str],
    my_commitments: List[Dict]
    ) -> Optional[str]:
    """generate meeting/networking/conversation preparation suggestions"""
    

    
    prompt = f"""You are helping prepare for a meeting with {person_name}. Based on our interaction history, provide specific, actionable conversation suggestions.

                CONTEXT ABOUT {person_name.upper()}:
                - We've met {events_count} times
                - Key facts: {[f['fact'] for f in facts[:5]]}
                - Their interests: {topics[:7]}
                - People in their network: {people_network[:5]}
                - My pending commitments: {[c['commitment'] for c in my_commitments]}

                Provide only:
                1. ONE specific way to add value based on their needs
                2. ONE topic to avoid (if any concerns exist)
                3. Action Items:
                   - [First action item]
                   - [Second action item]  
                   - [Third action item]

                Be extremely concise. No explanations or fluff.
            """

    try:
        response = client.chat.completions.create(
            model=current_model ,
            messages=[
                {"role": "system", "content": "You are an expert at building authentic professional relationships."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        return None

def generate_conversation_starters(
    person_name: str,
    recent_topics: List[str],
    recent_facts: List[Dict]
    ) -> Optional[List[str]]:
    """generate conversation starters"""
    # TODO: add more AI suggestions
    pass