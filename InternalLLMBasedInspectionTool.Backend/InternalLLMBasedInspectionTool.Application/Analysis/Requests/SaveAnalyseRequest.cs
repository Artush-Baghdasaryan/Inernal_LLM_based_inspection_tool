using InternalLLMBasedInspectionTool.Domain.Analysis;

namespace InternalLLMBasedInspectionTool.Application.Analysis.Requests;

public record SaveAnalyseRequest {
    public Guid AttachmentId { get; init; }
    public List<Issue> Issues { get; init; }
}