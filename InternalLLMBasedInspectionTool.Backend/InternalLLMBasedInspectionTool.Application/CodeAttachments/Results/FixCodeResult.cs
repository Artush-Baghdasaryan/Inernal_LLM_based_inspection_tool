namespace InternalLLMBasedInspectionTool.Application.CodeAttachments.Results;

public record FixCodeResult {
    public required string FixedCode { get; init; }
}

