from typing import List, Optional

from pydantic_ai import Agent, ModelSettings
from pydantic_ai.models.openai import OpenAIChatModel

from app.core.config import OPENAI_MODEL
from app.models import AnalyseCodeRequest, IssueModel, AnalyseCodeResult


class CodeAnalyzerAgent:
    def __init__(self, request: AnalyseCodeRequest):
        self.__request = request
        self.__llm = OpenAIChatModel(model_name=OPENAI_MODEL)


    async def execute(self) -> Optional[AnalyseCodeResult]:
        agent = self.__create_agent()
        result = await agent.run(self.__request.diff_hunks)
        print(f"Result from code analyzer: {result}")

        issues = result.output
        return AnalyseCodeResult(issues=issues) if issues else None


    def __create_agent(self) -> Agent:
        return Agent(
            model=self.__llm,
            system_prompt=self.__request.system_prompt,
            output_type=List[IssueModel],
            model_settings=ModelSettings(temperature=self.__request.temperature),
            retries=3
        )
