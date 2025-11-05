from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class IssueLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class IssueSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class IssueCategory(str, Enum):
    READABILITY = "readability"
    PERFORMANCE = "performance"
    CORRECTNESS = "correctness"
    STYLE = "style"
    MAINTAINABILITY = "maintainability"
    SECURITY = "security"


class IssueModel(BaseModel):
    title: str = Field(
        description="A brief, descriptive title for the issue (e.g., 'Undefined variable used')"
    )
    description: str = Field(
        description="A detailed explanation of the issue, including why it's problematic and its potential impact"
    )
    level: IssueLevel = Field(
        description="The level of the issue: 'info' for informational, 'warning' for potential problems, 'error' for critical issues"
    )
    severity: IssueSeverity = Field(
        description="The severity of the issue: 'low' for minor issues, 'medium' for important issues, 'high' for critical issues"
    )
    category: IssueCategory = Field(
        description="The category of the issue: 'readability', 'performance', 'correctness', 'style', 'maintainability', or 'security'"
    )
    confidence: float = Field(
        description="Confidence level in the issue detection (0.0 to 1.0), where 1.0 means very certain and 0.0 means uncertain"
    )
    start_line: Optional[int] = Field(
        default=None,
        description="The starting line number (1-based) where the issue occurs in the code. Must be provided if code_hint is provided."
    )
    end_line: Optional[int] = Field(
        default=None,
        description="The ending line number (1-based) where the issue occurs in the code. If not provided, defaults to start_line for single-line issues."
    )
    code_hint: Optional[str] = Field(
        default=None,
        description="A code snippet showing the problematic code section that triggered this issue. Include line numbers if possible. This helps users quickly identify the exact location of the problem."
    )