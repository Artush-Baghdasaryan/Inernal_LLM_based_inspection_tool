using InternalLLMBasedInspectionTool.Application.CodeAttachments.Requests;
using InternalLLMBasedInspectionTool.Application.CodeAttachments.Results;
using InternalLLMBasedInspectionTool.Domain.Analysis;
using InternalLLMBasedInspectionTool.Domain.CodeAttachments;

namespace InternalLLMBasedInspectionTool.Application.CodeAttachments;

public interface ICodeAttachmentsService {
    Task<List<CodeAttachment>> GetMetadataByUserIdAsync(Guid userId);
    Task<CodeAttachment> GetByIdAsync(Guid id);
    Task<CodeAttachment> CreateAsync(SaveCodeAttachmentRequest request);
    Task<CodeAttachment> UpdateAsync(Guid id, SaveCodeAttachmentRequest request);
    Task<FormPromptResult> FormPromptAsync(Guid id, Guid userId);
    Task DeleteAsync(Guid id);
    Task<Analyse> AnalyseAsync(Guid userId, Guid attachmentId, string systemPrompt);
    Task<Results.FixCodeResult> FixCodeAsync(Requests.FixCodeRequest request);
    Task MarkIssuesAsFixedAsync(Guid attachmentId, List<int> issueIndices);
}
