using System.Text.Json.Serialization;
using InternalLLMBasedInspectionTool.Domain.Analysis;

namespace InternalLLMBasedInspectionTool.Application.Integrations.AI.Models;

public record AiServiceIssueModel {
    [JsonPropertyName("title")]
    public required string Title { get; init; }
    [JsonPropertyName("description")]
    public required string Description { get; init; }
    [JsonPropertyName("level")]
    public required IssueLevel Level { get; init; }
    [JsonPropertyName("severity")]
    public required IssueSeverity Severity { get; init; }
    [JsonPropertyName("category")]
    public required IssueCategory Category { get; init; }
    [JsonPropertyName("confidence")]
    public required double Confidence { get; init; }
    [JsonPropertyName("start_line")]
    public int? StartLine { get; init; }
    [JsonPropertyName("end_line")]
    public int? EndLine { get; init; }
    [JsonPropertyName("code_hint")]
    public string? CodeHint { get; init; }
}
