namespace InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

public record FormPromptResultModel {
    public required string SystemPrompt { get; init; }
    public required string UserPrompt { get; init; }
}

