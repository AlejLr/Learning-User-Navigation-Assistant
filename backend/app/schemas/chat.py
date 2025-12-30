from pydantic import BaseModel, Field
from typing import Literal

Mode = Literal["recruiter", "visitor", "technical", "beginner"]

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=2)
    mode: Mode = "visitor"
    
class Link(BaseModel):
    title: str
    url: str
    
class QueryResponse(BaseModel):
    answer: str
    recommended_links: list[Link] = []
    suggested_questions: list[str] = []
    mode_used: Mode