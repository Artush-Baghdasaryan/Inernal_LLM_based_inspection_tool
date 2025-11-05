namespace InternalLLMBasedInspectionTool.WebApi.Models.Analysis;

public record AnalysisModel {
    public required string Id { get; init; }
    public required Guid AttachmentId { get; init; }
    public required List<IssueModel> Issues { get; init; }
}

