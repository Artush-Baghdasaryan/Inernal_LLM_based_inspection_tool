namespace InternalLLMBasedInspectionTool.WebApi.Models.CodeAttachments;

public record FixCodeRequestModel {
    public required Guid AttachmentId { get; init; }
    public required List<int> IssueIndices { get; init; }
}

