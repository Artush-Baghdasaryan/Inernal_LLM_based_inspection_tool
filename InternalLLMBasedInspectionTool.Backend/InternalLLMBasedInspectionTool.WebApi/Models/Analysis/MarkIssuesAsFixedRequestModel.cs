namespace InternalLLMBasedInspectionTool.WebApi.Models.Analysis;

public record MarkIssuesAsFixedRequestModel {
    public required Guid AttachmentId { get; init; }
    public required List<int> IssueIndices { get; init; }
}

