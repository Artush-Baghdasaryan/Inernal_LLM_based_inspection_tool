using InternalLLMBasedInspectionTool.Domain.CodeAttachments;
using InternalLLMBasedInspectionTool.Infrastructure.Common;
using InternalLLMBasedInspectionTool.Infrastructure.MongoDb;

namespace InternalLLMBasedInspectionTool.Infrastructure.Repositories;

public class CodeAttachmentsRepository : DataRepository<CodeAttachment>, ICodeAttachmentsRepository {
    public CodeAttachmentsRepository(MongoDbDataContext context) : base(context, "codeAttachments") {
    }

    public Task<List<CodeAttachment>> GetByUserIdAsync(Guid userId) {
        return FindAsync(c => c.UserId == userId);
    }
}
