"""
Data (pudantic) models 
"""
from typing import List, Optional
from pydantic import BaseModel, Field

class Fact(BaseModel):
    """A factual statement about a person"""
    fact: str = Field(description="The factual information")
    confidence: float = Field(description="Confidence score 0-1", ge=0, le=1)
    category: str = Field(description="Category: personal/professional/preference")
    
class PersonMentioned(BaseModel):
    """A person mentioned in the conversation"""
    name: str = Field(description="Person's name")
    context: str = Field(description="How they were mentioned")
    relationship: Optional[str] = Field(description="Relationship to the main person")
    confidence: float = Field(ge=0, le=1)

class Commitment(BaseModel):
    """A commitment or promise made"""
    commitment: str = Field(description="What was promised")
    by_whom: str = Field(description="Who made the commitment: 'me' or 'them'")
    deadline: Optional[str] = Field(description="When it should be done")
    confidence: float = Field(ge=0, le=1)

class Inference(BaseModel):
    """An inference or speculation"""
    inference: str = Field(description="The inferred information")
    reasoning: str = Field(description="Why this was inferred")
    confidence: float = Field(description="Confidence score 0-1", ge=0, le=1)

class ExtractedInfo(BaseModel):
    """Complete extraction from an interaction"""
    facts: List[Fact] = Field(default_factory=list)
    people_mentioned: List[PersonMentioned] = Field(default_factory=list)
    commitments: List[Commitment] = Field(default_factory=list)
    inferences: List[Inference] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list, description="1-3 key words that summarize this interaction")
    sentiment: str = Field(default="neutral", description="Overall sentiment")