using InternalLLMBasedInspectionTool.Domain.Common.Repositories;

namespace InternalLLMBasedInspectionTool.Domain.Analysis;

public interface IAnalysisRepository : IRepository<Analyse> {
    Task<Analyse?> GetByAttachmentIdAsync(Guid attachmentId);
}