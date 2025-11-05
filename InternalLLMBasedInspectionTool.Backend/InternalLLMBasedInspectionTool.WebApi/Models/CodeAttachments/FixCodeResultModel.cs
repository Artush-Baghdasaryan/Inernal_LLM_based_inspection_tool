namespace InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

public record FixCodeResultModel {
    public required string FixedCode { get; init; }
}

