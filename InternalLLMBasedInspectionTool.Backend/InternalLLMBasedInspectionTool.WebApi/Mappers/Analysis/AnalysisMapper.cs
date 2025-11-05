using InternalLLMBasedInspectionTool.Domain.Analysis;
using InternalLLMBasedInspectionTool.WebApi.Models.Analysis;

namespace InternalLLMBasedInspectionTool.WebApi.Mappers.Analysis;

public static class AnalysisMapper {
    public static AnalysisModel Map(Analyse analyse) {
        return new AnalysisModel {
            Id = analyse.Id.ToString(),
            AttachmentId = analyse.AttachmentId,
            Issues = IssueMapper.Map(analyse.Issues)
        };
    }
}

