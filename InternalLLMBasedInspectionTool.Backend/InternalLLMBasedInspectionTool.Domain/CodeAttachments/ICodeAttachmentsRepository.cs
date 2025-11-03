using InternalLLMBasedInspectionTool.Domain.Common.Repositories;

namespace InternalLLMBasedInspectionTool.Domain.CodeAttachments;

public interface ICodeAttachmentsRepository : IRepository<CodeAttachment> {
    Task<List<CodeAttachment>> GetByUserIdAsync(Guid userId);
}