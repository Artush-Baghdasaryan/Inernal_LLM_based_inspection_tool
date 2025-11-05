using System.Text.Json.Serialization;

namespace InternalLLMBasedInspectionTool.Application.Integrations.AI.Models.Requests;

public record AnalyseCodeRequest {
    [JsonPropertyName("system_prompt")]
    public required string SystemPrompt { get; init; }
    [JsonPropertyName("diff_hunks")]
    public required List<string> DiffHunks { get; init; }
    [JsonPropertyName("temperature")]
    public required double Temperature { get; init; }
}
