using InternalLLMBasedInspectionTool.Application.Analysis.Requests;
using InternalLLMBasedInspectionTool.Domain.Analysis;

namespace InternalLLMBasedInspectionTool.Application.Analysis;

public interface IAnalysisService {
    Task<Analyse> CreateAsync(SaveAnalyseRequest request);
    Task<Analyse?> GetByAttachmentIdAsync(Guid attachmentId);
    Task DeleteAsync(Guid id);
    Task DeleteByAttachmentIdAsync(Guid attachmentId);
    Task MarkIssuesAsFixedAsync(Guid attachmentId, List<int> issueIndices);
}
