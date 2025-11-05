from typing import List

from pydantic import BaseModel

from app.models.issue_model import IssueModel


class AnalyseCodeResult(BaseModel):
    issues: List[IssueModel]
