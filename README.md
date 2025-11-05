# Internal LLM Based Inspection Tool

A tool that helps you find and fix problems in your code using AI.

**What it does:**
- Upload your code file
- AI analyzes your code and finds issues (bugs, style problems, performance issues)
- You see a list of all found problems
- Choose which issues you want to fix
- AI automatically fixes the selected issues
- See the changes before applying them

## Services Overview

### Frontend (Angular)
**Purpose:** Web interface for users
- Upload and manage code files
- Display code editor with syntax highlighting
- Show analysis results and issues
- Allow users to select issues to fix
- Display diff view of fixed code
- Download and remove files

**Technology:** Angular 20, Monaco Editor

### Backend (C# ASP.NET)
**Purpose:** Main API server and business logic
- Receive code files from frontend
- Encrypt and store code in MongoDB
- Manage user sessions and settings
- Coordinate with AI Service for analysis
- Store analysis results
- Handle code fixing requests
- Manage file attachments (create, update, delete)

**Technology:** .NET 8, ASP.NET Core, MongoDB

### AI Service (Python FastAPI)
**Purpose:** AI-powered code analysis and fixing
- Analyze code using OpenAI LLM (AI Agents)
- Detect issues (bugs, style, performance, security)
- Fix code based on selected issues
- Process code with custom prompts and settings

**Technology:** Python, FastAPI, OpenAI API, Pydantic AI

### MongoDB
**Purpose:** Database storage
- Store encrypted code files
- Store analysis results
- Store user data and settings
- Store code attachment metadata

## Project Structure

- `InternalLLMBasedInspectionTool.Frontend` - Angular application
- `InternalLLMBasedInspectionTool.Backend` - C# ASP.NET Web API
- `InternalLLMBasedInspectionTool.AI` - Python FastAPI service
- `docs/` - Deployment documentation

## Requirements

- Node.js 18+ (for Angular development and build tools)
- .NET 8 SDK (for Backend)
- Python 3.10+ (for AI Service)
- MongoDB 6+ (for database)

See [deployment documentation](docs/) for detailed setup instructions:

- [Frontend Deployment](docs/deployment-frontend.md)
- [Backend Deployment](docs/deployment-backend.md)
- [AI Service Deployment](docs/deployment-ai-service.md)
- [MongoDB Deployment](docs/deployment-mongodb.md)
