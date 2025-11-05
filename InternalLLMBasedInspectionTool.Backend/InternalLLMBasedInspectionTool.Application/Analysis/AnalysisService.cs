using InternalLLMBasedInspectionTool.Application.Analysis.Requests;
using InternalLLMBasedInspectionTool.Domain.Analysis;

namespace InternalLLMBasedInspectionTool.Application.Analysis;

public class AnalysisService(
    IAnalysisRepository analysisRepository
) : IAnalysisService {
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

    public Task DeleteAsync(Guid id) {
        return analysisRepository.DeleteAsync(id);
    }

    public async Task DeleteByAttachmentIdAsync(Guid attachmentId) {
        var analyse = await analysisRepository.GetByAttachmentIdAsync(attachmentId);
        if (analyse != null) {
            await analysisRepository.DeleteAsync(analyse.Id);
        }
    }

    public async Task MarkIssuesAsFixedAsync(Guid attachmentId, List<int> issueIndices) {
        var analyse = await analysisRepository.GetByAttachmentIdAsync(attachmentId);
        if (analyse == null) {
            throw new Exception($"Analysis for attachment {attachmentId} not found");
        }

        // Mark selected issues as fixed
        for (int i = 0; i < analyse.Issues.Count; i++) {
            if (issueIndices.Contains(i)) {
                var issue = analyse.Issues[i];
                analyse.Issues[i] = issue with { IsFixed = true };
            }
        }

        // Update the analysis with fixed issues
        await analysisRepository.UpdateAsync(analyse);
    }
}
