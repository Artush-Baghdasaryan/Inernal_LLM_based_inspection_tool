namespace InternalLLMBasedInspectionTool.Application.Integrations.AI.Models;

public record AiServiceOptions {
    public required string BaseUrl { get; init; }
}