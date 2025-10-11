#!/usr/bin/env python3

"""
AI extraction module for structured information extraction
"""
from core.config import EXTRACTION_MODEL
import os
from typing import Tuple, Dict
from openai import OpenAI
import instructor
from dotenv import load_dotenv
from models.schemas import (
    Fact, 
    PersonMentioned, 
    Commitment, 
    Inference, 
    ExtractedInfo
)

load_dotenv()

# Initialize OpenAI with API key from .env
openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# Patch with instructor for structured output
client = instructor.from_openai(openai_client)

current_model = EXTRACTION_MODEL

def extract_information(raw_input: str, person_name: str) -> tuple[ExtractedInfo, dict]:
    """
    Extract structured information from raw input
    Returns: (extracted_info, confidence_scores)
    """
    
    system_prompt = f"""
        You are an assistant helping to extract structured information from social interaction conversations

        IMPORTANT: The main person being discussed is "{person_name}". References to this person may include:
        - First name only (e.g., "David" for "David Lee")
        - Last name only (e.g., "Lee" or "Mr.Lee" for "David Lee")
        - Case variations (e.g., "david", "DAVID", "David" all refer to the same person)
        - Initials (e.g., "DL" or "D.L."for "David Lee")
        - Nicknames or shortened versions (e.g., "Dave" for "David", "alex" for "Alexanderia")
        - Pronouns (he/she/they)
        - with or without title (e.g. "Mr.", "Ms.", "Dr.", "Prof.")
        - Self-references (himself/herself/themselves)

        These cases should NOT be counted as different people mentioned. For people_mentioned: DO NOT include the main person we're recording information about
        Only extract OTHER people who are mentioned in the conversation

        Only identify someone as a DIFFERENT person if:
        - They have a clearly different name (e.g. "Issac Newton", "Mark") or callsign (e.g. "the Chief").
        - The context explicitly indicates it's someone else (e.g., "my colleague Sarah")
        - They have a different role/relationship (e.g., "my advisor" is likely not the same as "{person_name}")

        IMPORTANT SOCIAL CONTEXT RULES:
        - In casual conversations, people typically use first names only
    
    

        CRITICAL: Distinguish between:
        - FACTS: Things explicitly stated (confidence 0.9-1.0)
        - CONTEXTUAL: Implied from context (confidence 0.7-0.9)
        - INFERENCES: Educated guesses (confidence 0.4-0.7)
        - SPECULATION: Weak assumptions (confidence 0.1-0.4)

        Extract information about the person and the interaction. Also extract 1-3 single-word keywords that best summarize this interaction.
        Keywords MUST be single words only (avoid phrases like "fintech startup" - use "fintech" instead). 
        ABSOLUTELY FORBIDDEN as keywords: any person names, first names, last names, or parts of names.
        FORBIDDEN: "john", "smith", "emily", "rodriguez", etc.
        REQUIRED: profession words like "engineer", "manager", "entrepreneur", "veterinarian".
        Also include: industry words like "fintech", "healthcare", "technology".
        Avoid generic words like "meeting", "chat", any verbs.
        Prefer: specific topics, technologies, industries, or unique identifiers as single words.
        Be conservative with confidence scores.
    """
    
    user_prompt = f"""
    Extract structured information from this interaction with {person_name}:
    
    IMPORTANT: {person_name} is the MAIN PERSON we're recording information about.
    Do not include {person_name} in the people_mentioned list.
    
    {raw_input}
    """
    
    # Use instructor to get structured output
    extracted = client.chat.completions.create(
        model=current_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_model=ExtractedInfo
    )
    
    # Calculate aggregate confidence scores
    confidence_scores = {
        "facts": sum(f.confidence for f in extracted.facts) / len(extracted.facts) if extracted.facts else 0,
        "people": sum(p.confidence for p in extracted.people_mentioned) / len(extracted.people_mentioned) if extracted.people_mentioned else 0,
        "commitments": sum(c.confidence for c in extracted.commitments) / len(extracted.commitments) if extracted.commitments else 0,
        "inferences": sum(i.confidence for i in extracted.inferences) / len(extracted.inferences) if extracted.inferences else 0,
        "overall": 0  # Will calculate
    }
    
    # Overall confidence is weighted average
    confidence_scores["overall"] = sum(confidence_scores.values()) / 4
    
    return extracted, confidence_scores

def format_extraction_for_display(extracted: ExtractedInfo) -> str:
    """Format extraction results for console display"""
    lines = []
    
    if extracted.facts:
        lines.append("[bold cyan]Facts:[/bold cyan]")
        for f in extracted.facts:
            conf_color = "green" if f.confidence > 0.8 else "yellow" if f.confidence > 0.5 else "red"
            lines.append(f"  • {f.fact} [{conf_color}]{f.confidence:.1f}[/{conf_color}]")
    
    if extracted.people_mentioned:
        lines.append("\n[bold cyan]People Mentioned:[/bold cyan]")
        for p in extracted.people_mentioned:
            lines.append(f"  • {p.name}: {p.context}")
    
    if extracted.commitments:
        lines.append("\n[bold cyan]Commitments:[/bold cyan]")
        for c in extracted.commitments:
            who = "I" if c.by_whom == "me" else "They"
            lines.append(f"  • {who} promised: {c.commitment}")
            if c.deadline:
                lines.append(f"    Deadline: {c.deadline}")
    
    if extracted.inferences:
        lines.append("\n[bold yellow]Inferences:[/bold yellow]")
        for i in extracted.inferences:
            lines.append(f"  • {i.inference} (because: {i.reasoning})")
    
    return "\n".join(lines)