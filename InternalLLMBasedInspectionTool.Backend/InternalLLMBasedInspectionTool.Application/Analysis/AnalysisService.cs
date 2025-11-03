using InternalLLMBasedInspectionTool.Application.Analysis.Requests;
using InternalLLMBasedInspectionTool.Domain.Analysis;

namespace InternalLLMBasedInspectionTool.Application.Analysis;

public class AnalysisService(IAnalysisRepository analysisRepository) : IAnalysisService {
    public async Task<Analyse> CreateAsync(SaveAnalyseRequest request) {
        var analyse = new Analyse {
            AttachmentId = request.AttachmentId,
            Issues = request.Issues
        };
        
        await analysisRepository.InsertAsync(analyse);
        return analyse;
    }

    public Task<Analyse?> GetByAttachmentIdAsync(Guid attachmentId) {
        return analysisRepository.GetByAttachmentIdAsync(attachmentId);
    }

    public async Task DeleteByAttachmentIdAsync(Guid attachmentId) {
        var analyse = await analysisRepository.GetByAttachmentIdAsync(attachmentId);
        if (analyse != null) {
            await analysisRepository.DeleteAsync(analyse.Id);
        }
    }
}
