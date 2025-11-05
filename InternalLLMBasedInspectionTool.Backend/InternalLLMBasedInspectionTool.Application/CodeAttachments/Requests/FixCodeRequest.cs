namespace InternalLLMBasedInspectionTool.Application.CodeAttachments.Requests;

public record FixCodeRequest {
    public required Guid AttachmentId { get; init; }
    public required List<int> IssueIndices { get; init; }
}

