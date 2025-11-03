using InternalLLMBasedInspectionTool.Application.CodeAttachments.Requests;
using InternalLLMBasedInspectionTool.Domain.CodeAttachments;

namespace InternalLLMBasedInspectionTool.Application.CodeAttachments;

public interface ICodeAttachmentsService {
    Task<List<CodeAttachment>> GetMetadataByUserIdAsync(Guid userId);
    Task<CodeAttachment> GetByIdAsync(Guid id);
    Task<CodeAttachment> CreateAsync(SaveCodeAttachmentRequest request);
    Task<CodeAttachment> UpdateAsync(Guid id, SaveCodeAttachmentRequest request);
    Task DeleteAsync(Guid id);
}
