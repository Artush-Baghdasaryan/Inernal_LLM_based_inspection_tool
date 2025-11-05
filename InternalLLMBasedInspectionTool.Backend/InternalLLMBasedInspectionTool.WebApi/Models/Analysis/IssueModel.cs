using InternalLLMBasedInspectionTool.Domain.Analysis;

namespace InternalLLMBasedInspectionTool.WebApi.Models.Analysis;

public record IssueModel {
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required IssueLevel Level { get; init; }
    public required IssueSeverity Severity { get; init; }
    public required IssueCategory Category { get; init; }
    public required double Confidence { get; init; }
    public int? StartLine { get; init; }
    public int? EndLine { get; init; }
    public string? CodeHint { get; init; }
    public bool IsFixed { get; init; } = false;
}

