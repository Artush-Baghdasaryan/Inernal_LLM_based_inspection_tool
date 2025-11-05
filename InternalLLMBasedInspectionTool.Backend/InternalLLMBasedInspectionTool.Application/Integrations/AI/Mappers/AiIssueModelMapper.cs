using System.Diagnostics.CodeAnalysis;
using InternalLLMBasedInspectionTool.Application.Integrations.AI.Models;
using InternalLLMBasedInspectionTool.Domain.Analysis;

namespace InternalLLMBasedInspectionTool.Application.Integrations.AI.Mappers;

public static class AiIssueModelMapper {
    [return: NotNullIfNotNull("aiServiceIssueModel")]
    public static Issue? Map(AiServiceIssueModel? aiServiceIssueModel) {
        if (aiServiceIssueModel == null) {
            return null;
        }

        return new Issue {
            Title = aiServiceIssueModel.Title,
            Description = aiServiceIssueModel.Description,
            Level = aiServiceIssueModel.Level,
            Severity = aiServiceIssueModel.Severity,
            Category = aiServiceIssueModel.Category,
            Confidence = aiServiceIssueModel.Confidence,
            StartLine = aiServiceIssueModel.StartLine,
            EndLine = aiServiceIssueModel.EndLine,
            CodeHint = aiServiceIssueModel.CodeHint,
            IsFixed = false
        };
    }
}
