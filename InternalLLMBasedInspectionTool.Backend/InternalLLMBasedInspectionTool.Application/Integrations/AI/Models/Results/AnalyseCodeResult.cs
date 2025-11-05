using System.Text.Json.Serialization;
using InternalLLMBasedInspectionTool.Application.Integrations.AI.Models;

namespace InternalLLMBasedInspectionTool.Application.Integrations.AI.Models.Results;

public record AnalyseCodeResult {
    [JsonPropertyName("issues")]
    public required List<AiServiceIssueModel> Issues { get; init; }
}
