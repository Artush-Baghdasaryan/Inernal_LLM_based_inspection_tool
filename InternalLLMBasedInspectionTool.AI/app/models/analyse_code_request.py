from typing import List

from pydantic import BaseModel


class AnalyseCodeRequest(BaseModel):
    system_prompt: str
    diff_hunks: List[str]
    temperature: float
