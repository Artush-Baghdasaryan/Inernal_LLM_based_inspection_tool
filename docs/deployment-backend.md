# Backend Deployment

## Requirements

- .NET 8 SDK
- MongoDB 6+ (locally on port 27017)

## Setup

```bash
cd InternalLLMBasedInspectionTool.Backend

# Restore dependencies
dotnet restore

# Run Web API
cd InternalLLMBasedInspectionTool.WebApi
dotnet run
```

- API runs on `http://localhost:5205`
- MongoDB: `mongodb://localhost:27017`

