from typing import Optional

from pydantic_ai import Agent, ModelSettings
from pydantic_ai.models.openai import OpenAIChatModel

from app.core.config import OPENAI_MODEL
from app.core.decryption import DataDecryptionService
from app.models.fix_code_request import FixCodeRequest, FixCodeResult
from app.agents.code_fixer_agent_prompts import SYSTEM_PROMPT


class CodeFixerAgent:
    def __init__(self, request: FixCodeRequest):
        self.__request = request
        self.__llm = OpenAIChatModel(model_name=OPENAI_MODEL, provider='openai')
        self.__decryption_service = DataDecryptionService()

    async def execute(self) -> Optional[FixCodeResult]:
        agent = self.__create_agent()
        prompt = self.__build_prompt()
        
        result = await agent.run(prompt)
        print(f"Result from code fixer: {result}")

        fixed_code = result.output
        return FixCodeResult(fixed_code=fixed_code) if fixed_code else None

    def __create_agent(self) -> Agent:
        return Agent(
            model=self.__llm,
            system_prompt=SYSTEM_PROMPT,
            output_type=str,
            model_settings=ModelSettings(temperature=0.3),  # Lower temperature for more deterministic fixes
            retries=3
        )

    def __build_prompt(self) -> str:
        # Decrypt the code
        edited_data = self.__decryption_service.decrypt(self.__request.edited_data_hashed)
        
        prompt_parts = []
        
        prompt_parts.append("Issues to fix:")
        for i, issue in enumerate(self.__request.issues, 1):
            issue_parts = [
                f"\nIssue {i}:",
                f"Title: {issue.title}",
                f"Description: {issue.description}",
            ]
            
            if issue.start_line is not None:
                line_info = f"Lines {issue.start_line}"
                if issue.end_line is not None and issue.end_line != issue.start_line:
                    line_info += f"-{issue.end_line}"
                issue_parts.append(f"Location: {line_info}")
            
            if issue.code_hint:
                issue_parts.append(f"Code Hint:\n{issue.code_hint}")
            
            prompt_parts.append("\n".join(issue_parts))
        
        # Add the code to fix
        prompt_parts.append("\n\nCode to fix:")
        prompt_parts.append("```" + self.__request.code_language)
        prompt_parts.append(edited_data)
        prompt_parts.append("```")
        
        prompt_parts.append("\n\nPlease fix all the identified issues in the code above. Return the complete fixed code.")
        
        return "\n".join(prompt_parts)

