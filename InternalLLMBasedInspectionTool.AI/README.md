# AI Service

FastAPI service for code analysis and fixing using OpenAI.

See [deployment documentation](../../docs/deployment-ai-service.md) for setup instructions.

## Development

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

- `POST /analyse-code` - Analyze code
- `POST /fix-code` - Fix code
