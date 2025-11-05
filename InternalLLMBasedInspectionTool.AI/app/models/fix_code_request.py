from typing import List
from pydantic import BaseModel, Field

from app.models.issue_model import IssueModel


class FixCodeRequest(BaseModel):
    edited_data_hashed: str = Field(description="The encrypted edited code that needs to be fixed")
    issues: List[IssueModel] = Field(description="List of issues that need to be fixed in the code")
    code_language: str = Field(description="Programming language of the code")


class FixCodeResult(BaseModel):
    fixed_code: str = Field(description="The fixed code with all issues resolved")

