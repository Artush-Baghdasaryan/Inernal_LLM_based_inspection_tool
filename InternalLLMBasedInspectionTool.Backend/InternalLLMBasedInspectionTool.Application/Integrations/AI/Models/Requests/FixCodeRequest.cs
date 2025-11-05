using System.Text.Json.Serialization;
using InternalLLMBasedInspectionTool.Application.Integrations.AI.Models;

namespace InternalLLMBasedInspectionTool.Application.Integrations.AI.Models.Requests;

public record AiServiceFixCodeRequest {
    [JsonPropertyName("edited_data_hashed")]
    public required string EditedDataHashed { get; init; }
    
    [JsonPropertyName("issues")]
    public required List<AiServiceIssueModel> Issues { get; init; }
    
    [JsonPropertyName("code_language")]
    public required string CodeLanguage { get; init; }
}

