namespace InternalLLMBasedInspectionTool.Application.CodeAttachments.Results;

public record FormPromptResult {
    public required string SystemPrompt { get; init; }
    public required string UserPrompt { get; init; }
}

