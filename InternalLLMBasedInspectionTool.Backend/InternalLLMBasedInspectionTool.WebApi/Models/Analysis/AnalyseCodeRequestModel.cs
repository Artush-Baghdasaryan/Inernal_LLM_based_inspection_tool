namespace InternalLLMBasedInspectionTool.WebApi.Models.Analysis;

public record AnalyseCodeRequestModel {
    public required string SystemPrompt { get; init; }
}

