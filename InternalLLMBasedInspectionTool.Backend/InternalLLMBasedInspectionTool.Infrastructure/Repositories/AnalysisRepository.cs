using InternalLLMBasedInspectionTool.Domain.Analysis;
using InternalLLMBasedInspectionTool.Infrastructure.Common;
using InternalLLMBasedInspectionTool.Infrastructure.MongoDb;

namespace InternalLLMBasedInspectionTool.Infrastructure.Repositories;

public class AnalysisRepository : DataRepository<Analyse>, IAnalysisRepository {
    public AnalysisRepository(MongoDbDataContext context) : base(context, "analyses") {
    }

    public Task<Analyse?> GetByAttachmentIdAsync(Guid attachmentId) {
        return FindOneAsync(a => a.AttachmentId == attachmentId);
    }

    public async Task DeleteByAttachmentIdAsync(Guid attachmentId) {
        var analysis = await GetByAttachmentIdAsync(attachmentId);
        if (analysis != null) {
            await DeleteAsync(analysis.Id);
        }
    }
}

