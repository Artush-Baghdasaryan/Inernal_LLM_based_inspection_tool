using System.Text.Json.Serialization;

namespace InternalLLMBasedInspectionTool.Application.Integrations.AI.Models.Results;

public record FixCodeResult {
    [JsonPropertyName("fixed_code")]
    public required string FixedCode { get; init; }
}

