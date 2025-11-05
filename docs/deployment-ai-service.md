# AI Service Deployment

## Requirements

- Python 3.10+

## Setup

```bash
cd InternalLLMBasedInspectionTool.AI

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo OPENAI_API_KEY=your_openai_api_key >> .env
echo OPENAI_MODEL=gpt-5 >> .env

# Run service
uvicorn app.main:app --reload
```

Service runs on `http://localhost:8000`

## API Endpoints

- `POST /analyse-code` - Analyze code
- `POST /fix-code` - Fix code

