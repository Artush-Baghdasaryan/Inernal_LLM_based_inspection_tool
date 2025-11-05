import os
from typing import Optional

from fastapi import FastAPI, Body, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.config import OPENAI_API_KEY
from app.agents.code_analyzer_agent import CodeAnalyzerAgent
from app.agents.code_fixer_agent import CodeFixerAgent
from app.models import AnalyseCodeRequest, AnalyseCodeResult, FixCodeRequest, FixCodeResult

os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    body_str = body.decode('utf-8') if body else ""
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body_preview": body_str[:500]}
    )


@app.post("/analyse-code")
async def analyse_code(request: AnalyseCodeRequest = Body(...)) -> Optional[AnalyseCodeResult]:
    print("Received analyse code request")
    agent = CodeAnalyzerAgent(request)
    return await agent.execute()


@app.post("/fix-code")
async def fix_code(request: FixCodeRequest = Body(...)) -> Optional[FixCodeResult]:
    try:
        print("Received fix code request")
        agent = CodeFixerAgent(request)
        return await agent.execute()
    except Exception as e:
        print(f"Error in fix_code: {str(e)}")
        print(f"Request: {request}")
        raise HTTPException(status_code=500, detail=str(e))
